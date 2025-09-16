#!/usr/bin/env python3
"""
Fine-tune Google Gemini model for Svelte 5 $inspect syntax
Using Google AI Studio / Vertex AI
"""

import google.generativeai as genai
import json
import os
from typing import List, Dict

class GeminiFinetuner:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        
    def prepare_gemini_training_data(self, input_file: str, output_file: str):
        """Convert JSONL to Gemini format"""
        training_data = []
        
        with open(input_file, 'r') as f:
            for line in f:
                data = json.loads(line)
                messages = data['messages']
                
                # Extract user and assistant messages
                user_msg = next(m['content'] for m in messages if m['role'] == 'user')
                assistant_msg = next(m['content'] for m in messages if m['role'] == 'assistant')
                
                training_data.append({
                    "text_input": user_msg,
                    "output": assistant_msg
                })
        
        with open(output_file, 'w') as f:
            json.dump(training_data, f, indent=2)
        
        print(f"Converted {len(training_data)} examples for Gemini")
        return output_file
    
    def create_tuned_model(self, training_data_path: str, model_name: str = "models/text-bison-001"):
        """Create a tuned model using Gemini"""
        
        # Read training data
        with open(training_data_path, 'r') as f:
            training_data = json.load(f)
        
        # Create tuning operation
        operation = genai.create_tuned_model(
            source_model=model_name,
            training_data=training_data,
            id="svelte-inspect-tuned",
            display_name="Svelte 5 $inspect Expert",
            description="Fine-tuned for correct Svelte 5 $inspect syntax with template literals"
        )
        
        print(f"Tuning operation created: {operation.name}")
        return operation

# Local Model Fine-tuning (Ollama/LLaMA)
def create_ollama_finetune_script():
    """Generate script for local fine-tuning with Ollama"""
    
    script_content = '''#!/bin/bash

# Fine-tune local LLaMA model for Svelte $inspect syntax

echo "🔧 Setting up local fine-tuning environment..."

# Install required packages
pip install transformers datasets torch accelerate peft

# Create training script
cat > train_svelte_model.py << 'EOF'
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from datasets import Dataset
import json

def load_training_data(file_path):
    """Load and format training data"""
    data = []
    with open(file_path, 'r') as f:
        for line in f:
            item = json.loads(line)
            messages = item['messages']
            
            # Format as conversation
            conversation = ""
            for msg in messages:
                role = msg['role']
                content = msg['content']
                conversation += f"<|{role}|>\\n{content}\\n"
            
            data.append({"text": conversation})
    
    return Dataset.from_list(data)

# Load model and tokenizer
model_name = "microsoft/DialoGPT-medium"  # Or any suitable base model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Add special tokens
special_tokens = {"pad_token": "[PAD]"}
tokenizer.add_special_tokens(special_tokens)
model.resize_token_embeddings(len(tokenizer))

# Load and tokenize data
dataset = load_training_data("comprehensive-training.jsonl")

def tokenize_function(examples):
    return tokenizer(examples["text"], truncation=True, padding=True, max_length=512)

tokenized_dataset = dataset.map(tokenize_function, batched=True)

# Training arguments
training_args = TrainingArguments(
    output_dir="./svelte-inspect-model",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=2,
    warmup_steps=100,
    logging_steps=10,
    save_steps=500,
    evaluation_strategy="no",
    save_total_limit=2,
    prediction_loss_only=True,
)

# Data collator
data_collator = DataCollatorForLanguageModeling(
    tokenizer=tokenizer,
    mlm=False,
)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    data_collator=data_collator,
    train_dataset=tokenized_dataset,
)

# Train
print("🚀 Starting training...")
trainer.train()

# Save model
trainer.save_model("./svelte-inspect-fine-tuned")
tokenizer.save_pretrained("./svelte-inspect-fine-tuned")
print("✅ Model saved!")

EOF

echo "🎯 Running fine-tuning..."
python train_svelte_model.py

echo "🔄 Converting to Ollama format..."
# Convert to GGUF format for Ollama (requires additional tools)
# This step would need ollama create command with proper Modelfile

echo "✅ Fine-tuning complete!"
echo "📁 Model saved to: ./svelte-inspect-fine-tuned"
'''
    
    with open('/Users/Abhijeet.Karpe/apps/svelte-bench/fine-tuning/local_finetune.sh', 'w') as f:
        f.write(script_content)
    
    os.chmod('/Users/Abhijeet.Karpe/apps/svelte-bench/fine-tuning/local_finetune.sh', 0o755)
    print("Created local fine-tuning script")

if __name__ == "__main__":
    create_ollama_finetune_script()