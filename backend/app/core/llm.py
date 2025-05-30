from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage
from backend.app.core.config import settings
from langchain.output_parsers import PydanticOutputParser
import os
import json
import re
import langchain, pydantic
import logging

logger = logging.getLogger(__name__)
logger.info(f"LangChain v{langchain.__version__}, Pydantic v{pydantic.__version__}")

"""
IMPORTANT: JSON Formatting Requirements for Prompts

When creating prompts that require JSON responses:
1. Use double curly braces {{}} for JSON examples in the prompt string
2. Keep JSON examples as single lines with no indentation
3. Make it explicit that the response should be a single line of JSON
4. Avoid complex template systems - use direct string formatting

Example of correct JSON in prompt:
{{"field": "value", "array": [{{"nested": "value"}}]}}

This ensures proper JSON parsing and avoids template formatting issues.
"""

class LLMService:
    def __init__(self):
        # Get the API key from environment variables
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")

        # Initialize the OpenAI chat model with explicit configuration
        self.chat_model = ChatOpenAI(
            model_name=settings.LLM_MODEL_NAME,
            openai_api_key=api_key,
            max_tokens=settings.MAX_TOKENS,
            temperature=settings.TEMPERATURE,
            request_timeout=30,  # Add timeout
            max_retries=3,  # Add retries
        )
        
        # Log the model configuration
        logger.info(f"Initialized LLM service with model: {settings.LLM_MODEL_NAME}")
        logger.info(f"Max tokens: {settings.MAX_TOKENS}")
        logger.info(f"Temperature: {settings.TEMPERATURE}")

    def generate_response(
        self,
        prompt_template: str,
        input_variables: dict,
        output_parser: PydanticOutputParser
    ):
        """
        Generate a response from the language model based on the provided prompt and variables,
        and parse the output using the provided parser.

        Note: When creating prompt templates that require JSON responses:
        1. Use double curly braces {{}} for JSON examples
        2. Keep JSON examples as single lines
        3. Make it explicit that the response should be a single line of JSON
        4. Use direct string formatting instead of complex template systems
        """
        try:
            # Format the prompt template with input variables
            formatted_prompt = prompt_template.format(**input_variables)
            logger.info(f"Formatted prompt: {formatted_prompt}")
            
            # Create a single human message
            message = HumanMessage(content=formatted_prompt)
            
            # Pass the message to the LLM and get a response
            response = self.chat_model([message])
            
            # Log the raw response for debugging
            logger.info(f"Raw LLM response: {response.content}")
            
            # Clean up the response
            content = response.content.strip()
            logger.info(f"After strip: {content}")
            
            # Remove any markdown code block markers
            if content.startswith('```json'):
                content = content[7:]
                logger.info("Removed ```json prefix")
            elif content.startswith('```'):
                content = content[3:]
                logger.info("Removed ``` prefix")
            if content.endswith('```'):
                content = content[:-3]
                logger.info("Removed ``` suffix")
            
            logger.info(f"After markdown cleanup: {content}")
            
            # Remove any explanatory text before or after the JSON
            content = re.sub(r'^[^{]*', '', content)  # Remove everything before first {
            content = re.sub(r'[^}]*$', '', content)  # Remove everything after last }
            logger.info(f"After text cleanup: {content}")
            
            # Remove indentation and extra whitespace
            content = re.sub(r'^\s+', '', content, flags=re.MULTILINE)  # Remove leading whitespace
            content = re.sub(r'\s+', ' ', content)  # Replace multiple spaces with single space
            content = content.strip()
            logger.info(f"After whitespace cleanup: {content}")
            
            # Ensure it starts with { and ends with }
            if not content.startswith('{'):
                content = '{' + content
                logger.info("Added missing {")
            if not content.endswith('}'):
                content = content + '}'
                logger.info("Added missing }")
            
            # Log the cleaned content for debugging
            logger.info(f"Final cleaned content: {content}")
            
            # Try to parse the response
            try:
                # First try to parse as JSON to validate the format
                parsed_json = json.loads(content)
                logger.info(f"Parsed JSON: {parsed_json}")
                
                # Then try to parse with the Pydantic parser
                parsed_result = output_parser.parse(content)
                logger.info(f"Successfully parsed result: {parsed_result}")
                return parsed_result
            except json.JSONDecodeError as json_error:
                logger.error(f"JSON parsing error: {json_error}")
                logger.error(f"Invalid JSON content: {content}")
                # Try to fix common JSON formatting issues
                try:
                    # Fix missing quotes around keys
                    content = re.sub(r'([{,])\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', content)
                    logger.info(f"After fixing keys: {content}")
                    # Fix missing quotes around string values
                    content = re.sub(r':\s*([a-zA-Z][a-zA-Z0-9\s]*)([,}])', r': "\1"\2', content)
                    logger.info(f"After fixing values: {content}")
                    # Try parsing again
                    parsed_json = json.loads(content)
                    parsed_result = output_parser.parse(content)
                    logger.info(f"Successfully parsed fixed result: {parsed_result}")
                    return parsed_result
                except Exception as fix_error:
                    logger.error(f"Failed to fix JSON: {fix_error}")
                    raise ValueError(f"Invalid JSON response from LLM: {str(json_error)}")
            except Exception as parse_error:
                logger.error(f"Error parsing response: {parse_error}")
                logger.error(f"Raw response: {content}")
                raise ValueError(f"Error parsing LLM response: {str(parse_error)}")
                
        except Exception as e:
            # Log error and re-raise
            logger.error(f"Error generating response: {e}")
            logger.error(f"Error type: {type(e)}")
            logger.error(f"Error args: {e.args}")
            raise e


# Create an instance of LLMService to use across the app
llm_service = LLMService()
