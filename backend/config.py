import json
import os

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "..", "config", "settings.json")

def load_config():
    if not os.path.exists(CONFIG_FILE):
        return {"database_url": "sqlite:///./database/projet_manager.db"}
    with open(CONFIG_FILE, "r") as f:
        return json.load(f)

def save_config(config):
    os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=4)
