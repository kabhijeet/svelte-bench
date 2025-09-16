#!/usr/bin/env python3
"""
Test fine-tuned models against the original failing cases
"""

import json
import openai
import os
from typing import List, Dict, Tuple

class ModelTester:
    def __init__(self):
        self.test_cases = [
            {
                "prompt": "Create a Svelte 5 component with $inspect that logs 'Text updated to: [value]' when text changes",
                "expected_patterns": [
                    "console.log(`Text updated to: \"${value}\"`)",
                    "data-testid=\"text-input\"",
                    "bind:value={text}"
                ],
                "forbidden_patterns": [
                    "console.log(Text updated to:",  # Missing backticks
                    "<input ",  # Incomplete tag
                ]
            },
            {
                "prompt": "Create $inspect.trace with effect that logs character count",
                "expected_patterns": [
                    "console.log(`",  # Must have backticks
                    "${text.length}",
                    "$inspect.trace",
                    "$effect("
                ],
                "forbidden_patterns": [
                    "console.log(The text is now:",  # Missing backticks
                ]
            }
        ]
    
    def test_model(self, model_id: str, provider: str = "openai") -> Dict:
        """Test a model against all test cases"""
        results = {
            "model_id": model_id,
            "provider": provider,
            "test_results": [],
            "overall_score": 0
        }
        
        for i, test_case in enumerate(self.test_cases):
            print(f"Testing case {i+1}: {test_case['prompt'][:50]}...")
            
            try:
                # Generate response
                if provider == "openai":
                    response = self._test_openai_model(model_id, test_case['prompt'])
                elif provider == "gemini":
                    response = self._test_gemini_model(model_id, test_case['prompt'])
                else:
                    response = "Provider not supported"
                
                # Evaluate response
                score = self._evaluate_response(response, test_case)
                
                results["test_results"].append({
                    "prompt": test_case['prompt'],
                    "response": response,
                    "score": score,
                    "passed": score > 0.8
                })
                
                print(f"  Score: {score:.2f}")
                
            except Exception as e:
                print(f"  Error: {e}")
                results["test_results"].append({
                    "prompt": test_case['prompt'],
                    "response": f"Error: {e}",
                    "score": 0,
                    "passed": False
                })
        
        # Calculate overall score
        scores = [r["score"] for r in results["test_results"]]
        results["overall_score"] = sum(scores) / len(scores) if scores else 0
        
        return results
    
    def _test_openai_model(self, model_id: str, prompt: str) -> str:
        """Test OpenAI model"""
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        response = client.chat.completions.create(
            model=model_id,
            messages=[
                {"role": "system", "content": "You are an expert Svelte 5 developer. Always use proper JavaScript syntax including backticks for template literals."},
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )
        
        return response.choices[0].message.content
    
    def _test_gemini_model(self, model_id: str, prompt: str) -> str:
        """Test Gemini model (placeholder)"""
        # Implementation would depend on Gemini API
        return "Gemini testing not implemented"
    
    def _evaluate_response(self, response: str, test_case: Dict) -> float:
        """Evaluate response quality"""
        score = 0.0
        total_checks = len(test_case['expected_patterns']) + len(test_case['forbidden_patterns'])
        
        # Check for expected patterns
        for pattern in test_case['expected_patterns']:
            if pattern in response:
                score += 1.0
            else:
                print(f"    Missing expected: {pattern}")
        
        # Check for forbidden patterns (penalize)
        for pattern in test_case['forbidden_patterns']:
            if pattern in response:
                score -= 1.0
                print(f"    Found forbidden: {pattern}")
        
        return max(0.0, score / total_checks) if total_checks > 0 else 0.0
    
    def compare_models(self, models: List[Tuple[str, str]]) -> Dict:
        """Compare multiple models"""
        comparison = {
            "models": [],
            "summary": {}
        }
        
        for model_id, provider in models:
            print(f"\n{'='*50}")
            print(f"Testing {provider}: {model_id}")
            print('='*50)
            
            results = self.test_model(model_id, provider)
            comparison["models"].append(results)
        
        # Generate summary
        comparison["summary"] = {
            "best_model": max(comparison["models"], key=lambda x: x["overall_score"]),
            "improvement_needed": any(m["overall_score"] < 0.8 for m in comparison["models"])
        }
        
        return comparison
    
    def save_results(self, results: Dict, filename: str):
        """Save test results"""
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\n📊 Results saved to: {filename}")

def main():
    tester = ModelTester()
    
    # Test models (update with your fine-tuned model IDs)
    models_to_test = [
        ("gpt-3.5-turbo", "openai"),  # Baseline
        # ("ft:gpt-3.5-turbo:your-org:svelte-inspect:xyz", "openai"),  # Fine-tuned
    ]
    
    print("🧪 Starting model comparison...")
    results = tester.compare_models(models_to_test)
    
    # Save results
    tester.save_results(results, "/Users/Abhijeet.Karpe/apps/svelte-bench/fine-tuning/test_results.json")
    
    # Print summary
    print(f"\n🏆 Best Model: {results['summary']['best_model']['model_id']}")
    print(f"📊 Score: {results['summary']['best_model']['overall_score']:.2f}")
    
    if results['summary']['improvement_needed']:
        print("⚠️  Some models need more training")
    else:
        print("✅ All models performing well!")

if __name__ == "__main__":
    main()