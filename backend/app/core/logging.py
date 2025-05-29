import sys
import logging
import structlog
from pythonjsonlogger import jsonlogger
from typing import Any, Dict

def setup_logging():
    """Configure structured logging for the application."""
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer()
        ],
        wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Configure root logger to use JSON formatter
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Add JSON handler for stdout
    json_handler = logging.StreamHandler(sys.stdout)
    json_handler.setFormatter(jsonlogger.JsonFormatter(
        '%(timestamp)s %(level)s %(name)s %(message)s'
    ))
    root_logger.addHandler(json_handler)

    # Create logger instance
    logger = structlog.get_logger()
    logger.info("logging_configured", message="Structured logging has been configured")
    return logger

# Initialize logging
logger = setup_logging()

def log_event(event: str, **kwargs: Any) -> None:
    """Log an event with structured data."""
    logger.info(event, **kwargs)

def log_error(event: str, error: Exception, **kwargs: Any) -> None:
    """Log an error with structured data."""
    error_data = {
        "error_type": type(error).__name__,
        "error_message": str(error),
        **kwargs
    }
    logger.error(event, **error_data) 