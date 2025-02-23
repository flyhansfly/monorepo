import json
import os

# Define paths relative to the script's location.
# Adjust these paths based on your actual directory structure.
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_RAW_DIR = os.path.join(PROJECT_ROOT, "data", "raw")
DATA_PROCESSED_DIR = os.path.join(PROJECT_ROOT, "data", "processed")
os.makedirs(DATA_PROCESSED_DIR, exist_ok=True)

GUIDELINES_FILE = os.path.join(DATA_RAW_DIR, "guidelines.jsonl")
USER_RESPONSES_FILE = os.path.join(DATA_RAW_DIR, "user_responses.jsonl")
OUTPUT_FILE = os.path.join(DATA_PROCESSED_DIR, "training_data.jsonl")

def load_jsonl(file_path):
    """Load records from a JSONL file."""
    records = []
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            for line in f:
                if line.strip():
                    records.append(json.loads(line))
    return records

def main():
    guidelines = load_jsonl(GUIDELINES_FILE)
    user_responses = load_jsonl(USER_RESPONSES_FILE)
    
    # Optionally, you can add additional processing here (e.g., filtering, normalization)
    merged_data = guidelines + user_responses
    
    # Write the merged data to a new JSONL file
    with open(OUTPUT_FILE, "w") as f:
        for record in merged_data:
            f.write(json.dumps(record) + "\n")
    
    print(f"Merged {len(merged_data)} records into {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
