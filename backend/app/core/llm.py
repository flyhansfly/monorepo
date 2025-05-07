from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage
from app.core.config import settings
from langchain.output_parsers import PydanticOutputParser
import os
import json
import re
import langchain, pydantic
import logging

logger = logging.getLogger(__name__)
logger.info(f"LangChain v{langchain.__version__}, Pydantic v{pydantic.__version__}")


class LLMService:
    def __init__(self):
        # Get the API key from environment variables
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")

        # Initialize the OpenAI chat model
        self.chat_model = ChatOpenAI(
            model_name=settings.LLM_MODEL_NAME,
            openai_api_key=api_key,
            max_tokens=settings.MAX_TOKENS,
            temperature=settings.TEMPERATURE,
        )

    def generate_response(
        self,
        prompt_template: str,
        input_variables: dict,
        output_parser: PydanticOutputParser
    ):
        """
        Generate a response from the language model based on the provided prompt and variables,
        and parse the output using the provided parser.
        """
        try:
            # Create a ChatPromptTemplate
            prompt = ChatPromptTemplate.from_template(prompt_template)
            
            # Log the input variables for debugging
            logger.info(f"Input variables: {input_variables}")
            
            # Render the prompt with the input variables
            rendered_prompt = prompt.format(**input_variables)
            
            # Log the rendered prompt for debugging
            logger.info(f"Rendered prompt: {rendered_prompt}")
            
            # Pass the message to the LLM and get a response
            response = self.chat_model([HumanMessage(content=rendered_prompt)])
            
            # Log the raw response for debugging
            logger.info(f"Raw LLM response: {response.content}")
            
            # Clean up the response
            content = response.content.strip()
            
            # Remove any markdown code block markers
            if content.startswith('```json'):
                content = content[7:]
            elif content.startswith('```'):
                content = content[3:]
            if content.endswith('```'):
                content = content[:-3]
            
            # Remove any explanatory text before or after the JSON
            content = re.sub(r'^[^{]*', '', content)  # Remove everything before first {
            content = re.sub(r'[^}]*$', '', content)  # Remove everything after last }
            
            # Ensure the content is a single line
            content = ' '.join(content.split())
            
            # Ensure it starts with { and ends with }
            if not content.startswith('{'):
                content = '{' + content
            if not content.endswith('}'):
                content = content + '}'
            
            # Log the cleaned content for debugging
            logger.info(f"Cleaned content: {content}")
            
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
