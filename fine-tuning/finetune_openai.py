#!/usr/bin/env python3
"""
Fine-tune OpenAI model for Svelte 5 $inspect syntax
"""

import openai
import json
import os
from typing import List, Dict

class SvelteFinetuner:
    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)
        
    def upload_training_file(self, file_path: str) -> str:
        """Upload training data to OpenAI"""
        print(f"Uploading training file: {file_path}")
        
        with open(file_path, 'rb') as f:
            response = self.client.files.create(
                file=f,
                purpose="fine-tune"
            )
        
        print(f"File uploaded successfully. ID: {response.id}")
        return response.id
    
    def create_fine_tune_job(self, file_id: str, model: str = "gpt-3.5-turbo") -> str:
        """Create fine-tuning job"""
        print(f"Creating fine-tune job with model: {model}")
        
        response = self.client.fine_tuning.jobs.create(
            training_file=file_id,
            model=model,
            hyperparameters={
                "n_epochs": 3,  # More epochs for better learning
                "batch_size": 4,
                "learning_rate_multiplier": 0.1
            }
        )
        
        print(f"Fine-tune job created. ID: {response.id}")
        return response.id
    
    def monitor_job(self, job_id: str):
        """Monitor fine-tuning progress"""
        print(f"Monitoring job: {job_id}")
        
        job = self.client.fine_tuning.jobs.retrieve(job_id)
        print(f"Status: {job.status}")
        
        if job.status == "succeeded":
            print(f"✅ Fine-tuning completed!")
            print(f"📝 Fine-tuned model: {job.fine_tuned_model}")
            return job.fine_tuned_model
        elif job.status == "failed":
            print(f"❌ Fine-tuning failed: {job.error}")
            return None
        else:
            print(f"⏳ Still running... Status: {job.status}")
            return None
    
    def test_fine_tuned_model(self, model_id: str, test_prompt: str):
        """Test the fine-tuned model"""
        print(f"Testing model: {model_id}")
        
        response = self.client.chat.completions.create(
            model=model_id,
            messages=[
                {"role": "system", "content": "You are an expert Svelte 5 developer. Always use proper JavaScript syntax including backticks for template literals."},
                {"role": "user", "content": test_prompt}
            ],
            temperature=0
        )
        
        return response.choices[0].message.content

# Usage script
def main():
    # Set your OpenAI API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ Please set OPENAI_API_KEY environment variable")
        return
    
    finetuner = SvelteFinetuner(api_key)
    
    # Step 1: Upload training data
    training_file_path = "/Users/Abhijeet.Karpe/apps/svelte-bench/fine-tuning/comprehensive-training.jsonl"
    file_id = finetuner.upload_training_file(training_file_path)
    
    # Step 2: Create fine-tune job
    job_id = finetuner.create_fine_tune_job(file_id)
    
    print("\n" + "="*50)
    print("FINE-TUNING STARTED")
    print("="*50)
    print(f"📁 File ID: {file_id}")
    print(f"🔄 Job ID: {job_id}")
    print("\nMonitor progress with:")
    print(f"python monitor_finetuning.py {job_id}")
    
if __name__ == "__main__":
    main()