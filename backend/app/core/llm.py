from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage
from app.core.config import settings
from langchain.output_parsers import PydanticOutputParser


class LLMService:
    def __init__(self):
        # Initialize the OpenAI chat model
        self.chat_model = ChatOpenAI(
            model=settings.LLM_MODEL_NAME,
            openai_api_key=settings.OPENAI_API_KEY,
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
            # Render the prompt with the input variables
            rendered_prompt = prompt.format(**input_variables)
            # Pass the message to the LLM and get a response
            response = self.chat_model([HumanMessage(content=rendered_prompt)])
            # Parse the response using the output parser
            return output_parser.parse(response.content.strip())
        except Exception as e:
            # Log error and re-raise
            print(f"Error generating response: {e}")
            raise e


# Create an instance of LLMService to use across the app
llm_service = LLMService()
