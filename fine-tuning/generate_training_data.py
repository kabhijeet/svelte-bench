#!/usr/bin/env python3
"""
Generate comprehensive training data for Svelte 5 $inspect fine-tuning
"""

import json
import random

# Base patterns that need to be learned correctly
console_patterns = [
    "Text updated to: \"${value}\"",
    "The text is now: \"${text}\" (${text.length} characters)",
    "Value changed: ${newValue}",
    "Input updated: \"${inputValue}\"",
    "Counter is now: ${count}",
]

# Template for generating training examples
def generate_training_example(pattern, task_description):
    wrong_pattern = pattern.replace('`', '')  # Remove backticks (common error)
    
    return {
        "messages": [
            {
                "role": "system", 
                "content": "You are an expert Svelte 5 developer. Always use proper JavaScript syntax including backticks for template literals."
            },
            {
                "role": "user", 
                "content": f"Create $inspect with console.log that {task_description}"
            },
            {
                "role": "assistant", 
                "content": f"""<svelte:options runes={{true}} />

<script>
\tlet text = $state("Hello world");
\t
\t$inspect(text).with((type, value) => {{
\t\tif (type === "update") {{
\t\t\tconsole.log(`{pattern}`);
\t\t}}
\t}});
</script>

<div>
\t<input 
\t\tdata-testid="text-input" 
\t\ttype="text" 
\t\tbind:value={{text}} 
\t/>
</div>"""
            }
        ]
    }

# Generate comprehensive dataset
training_examples = []

# Positive examples (correct syntax)
patterns_tasks = [
    ("Text updated to: \"${value}\"", "logs text updates"),
    ("The text is now: \"${text}\" (${text.length} characters)", "shows text and length"),
    ("Value changed: ${newValue}", "tracks value changes"),
    ("Input updated: \"${inputValue}\"", "monitors input updates"),
    ("Counter is now: ${count}", "displays counter value"),
]

for pattern, task in patterns_tasks:
    training_examples.append(generate_training_example(pattern, task))

# Negative examples (showing what NOT to do)
negative_examples = [
    {
        "messages": [
            {"role": "system", "content": "You are an expert Svelte 5 developer. Always use proper JavaScript syntax including backticks for template literals."},
            {"role": "user", "content": "What's wrong with this code: console.log(Text updated: \"${value}\");"},
            {"role": "assistant", "content": "The issue is missing backticks around the template literal. Template literals in JavaScript MUST use backticks (`), not quotes or no quotes.\n\n❌ WRONG:\nconsole.log(Text updated: \"${value}\");\n\n✅ CORRECT:\nconsole.log(`Text updated: \"${value}\"`);\n\nWithout backticks, this causes a syntax error."}
        ]
    },
    {
        "messages": [
            {"role": "system", "content": "You are an expert Svelte 5 developer. Always use proper JavaScript syntax including backticks for template literals."},
            {"role": "user", "content": "Fix this broken template literal: console.log(The text is: ${text});"},
            {"role": "assistant", "content": "The template literal is missing backticks. Here's the fix:\n\n❌ WRONG:\nconsole.log(The text is: ${text});\n\n✅ CORRECT:\nconsole.log(`The text is: ${text}`);\n\nTemplate literals with ${} interpolation must be wrapped in backticks (`) to work correctly."}
        ]
    }
]

training_examples.extend(negative_examples)

# Save training data
with open('/Users/Abhijeet.Karpe/apps/svelte-bench/fine-tuning/comprehensive-training.jsonl', 'w') as f:
    for example in training_examples:
        f.write(json.dumps(example) + '\n')

print(f"Generated {len(training_examples)} training examples")
print("Saved to: fine-tuning/comprehensive-training.jsonl")