# Svelte 5 $inspect Syntax Fine-tuning

This directory contains scripts and data for fine-tuning LLMs to correctly generate Svelte 5 `$inspect` syntax, specifically addressing the widespread issue of missing backticks in template literals.

## Problem Statement

Multiple LLMs (Gemini 2.5 Flash, Qwen3-Coder) consistently generate incorrect JavaScript template literal syntax in Svelte components:

### ❌ **Common Errors Generated:**
```javascript
// Missing backticks (causes syntax error)
console.log(Text updated to: "${value}");
console.log(The text is now: "${text}" (${text.length} characters));

// Incomplete HTML tags
<input 
```

### ✅ **Correct Syntax Expected:**
```javascript
// Proper template literals with backticks
console.log(`Text updated to: "${value}"`);
console.log(`The text is now: "${text}" (${text.length} characters)`);

// Complete HTML tags
<input 
    data-testid="text-input" 
    id="text-input" 
    type="text" 
    bind:value={text} 
/>
```

## Why Fine-tuning Works for This Problem

### 🎯 **Perfect Use Case:**
- **Specific syntax patterns** - Template literal backticks, complete HTML tags
- **Repeatable errors** - Same mistakes across multiple models
- **Domain-specific** - Svelte 5 + JavaScript patterns
- **Clear correct/incorrect examples** - We have excellent training data

### 📊 **Expected Results:**
- **High success rate** - Syntax errors are learnable patterns
- **Consistent improvement** - Models will learn the specific patterns
- **Transferable knowledge** - Will help with similar JavaScript/Svelte tasks

## Root Cause Analysis

The consistent errors across different models suggest **training data contamination** where LLMs learned from:
- **Stack Overflow examples** with syntax errors that got upvoted
- **Tutorial websites** with incomplete code examples  
- **GitHub repositories** with buggy template literal usage
- **Documentation sites** that show fragmented code snippets

## Implementation Steps

### Step 1: Generate Training Data

Generate comprehensive training examples with correct and incorrect patterns:

```bash
cd /Users/Abhijeet.Karpe/apps/svelte-bench/fine-tuning
python generate_training_data.py
```

**Files generated:**
- `training-data.jsonl` - Basic training examples
- `comprehensive-training.jsonl` - Extended dataset with positive/negative examples

### Step 2: Choose Your Fine-tuning Approach

#### Option A: OpenAI Fine-tuning (Recommended)

**Cost:** ~$20-50 for training + $0.002/1K tokens for inference
**Timeline:** 1-3 hours training

```bash
# Set API key
export OPENAI_API_KEY="your-openai-api-key-here"

# Start fine-tuning
python finetune_openai.py
```

**What it does:**
1. Uploads training data to OpenAI
2. Creates fine-tuning job with optimized hyperparameters:
   - `n_epochs: 3` - More epochs for better learning
   - `batch_size: 4`
   - `learning_rate_multiplier: 0.1`
3. Returns job ID for monitoring

**Monitor progress:**
```bash
# Check job status
python -c "
from finetune_openai import SvelteFinetuner
import os
finetuner = SvelteFinetuner(os.getenv('OPENAI_API_KEY'))
finetuner.monitor_job('ftjob-YOUR-JOB-ID')
"
```

#### Option B: Google Gemini Fine-tuning

**Cost:** ~$10-30 for training + lower inference costs
**Timeline:** 2-6 hours training

```bash
# Set API key
export GOOGLE_API_KEY="your-google-api-key-here"

# Start fine-tuning
python finetune_gemini.py
```

**What it does:**
1. Converts JSONL training data to Gemini format
2. Creates tuned model via Google AI Studio/Vertex AI
3. Configures model as "Svelte 5 $inspect Expert"

#### Option C: Local Fine-tuning (Free)

**Cost:** Free (requires GPU time)
**Timeline:** 4-8 hours depending on hardware

```bash
# Make script executable
chmod +x local_finetune.sh

# Run local fine-tuning
./local_finetune.sh
```

**What it does:**
1. Installs required packages: `transformers`, `datasets`, `torch`, `accelerate`, `peft`
2. Uses DialoGPT-medium as base model
3. Trains for 3 epochs with gradient accumulation
4. Saves model to `./svelte-inspect-fine-tuned`
5. Optionally converts to Ollama GGUF format

### Step 3: Test and Validate

Test your fine-tuned model against the original failing cases:

```bash
# Test fine-tuned model
python test_models.py
```

**Test cases include:**
1. **Template literal syntax** - Ensures backticks are used correctly
2. **Complete HTML tags** - Validates full input element generation
3. **Svelte-specific patterns** - Tests `$inspect`, `$effect`, `data-testid` attributes

**Success criteria:**
- **Syntax errors reduced to 0%** - No more missing backticks
- **Complete tags generated** - Proper HTML structure  
- **Test pass rate > 90%** - Passing existing benchmark tests
- **Consistent patterns** - Reliable template literal usage

### Step 4: Compare with Baseline

```bash
# Compare fine-tuned vs original model
python -c "
from test_models import ModelTester
tester = ModelTester()

# Test baseline
baseline = tester.test_model('gpt-3.5-turbo', 'openai')
print(f'Baseline Score: {baseline[\"overall_score\"]:.2f}')

# Test fine-tuned (replace with your model ID)
finetuned = tester.test_model('ft:gpt-3.5-turbo:your-org:svelte-inspect:xyz', 'openai')
print(f'Fine-tuned Score: {finetuned[\"overall_score\"]:.2f}')

improvement = finetuned['overall_score'] - baseline['overall_score']
print(f'Improvement: {improvement:.2f} ({improvement*100:.1f}%)')
"
```

## File Structure

```
fine-tuning/
├── README.md                     # This file
├── generate_training_data.py     # Generate comprehensive training dataset
├── training-data.jsonl          # Basic training examples
├── comprehensive-training.jsonl  # Extended dataset (generated)
├── finetune_openai.py           # OpenAI fine-tuning implementation
├── finetune_gemini.py           # Google Gemini fine-tuning
├── local_finetune.sh            # Local fine-tuning script
├── test_models.py               # Model testing and validation
└── test_results.json            # Test results (generated)
```

## Training Data Format

### Positive Examples (Correct Syntax)
```json
{
  "messages": [
    {
      "role": "system", 
      "content": "You are an expert Svelte 5 developer. Always use proper JavaScript syntax including backticks for template literals."
    },
    {
      "role": "user", 
      "content": "Create $inspect with console.log that logs text updates"
    },
    {
      "role": "assistant", 
      "content": "<svelte:options runes={true} />\n\n<script>\n\tlet text = $state(\"Hello world\");\n\t\n\t$inspect(text).with((type, value) => {\n\t\tif (type === \"update\") {\n\t\t\tconsole.log(`Text updated to: \"${value}\"`);\n\t\t}\n\t});\n</script>\n\n<div>\n\t<input \n\t\tdata-testid=\"text-input\" \n\t\ttype=\"text\" \n\t\tbind:value={text} \n\t/>\n</div>"
    }
  ]
}
```

### Negative Examples (Teaching What NOT to Do)
```json
{
  "messages": [
    {
      "role": "system", 
      "content": "You are an expert Svelte 5 developer. Always use proper JavaScript syntax including backticks for template literals."
    },
    {
      "role": "user", 
      "content": "What's wrong with this code: console.log(Text updated: \"${value}\");"
    },
    {
      "role": "assistant", 
      "content": "The issue is missing backticks around the template literal. Template literals in JavaScript MUST use backticks (`), not quotes or no quotes.\n\n❌ WRONG:\nconsole.log(Text updated: \"${value}\");\n\n✅ CORRECT:\nconsole.log(`Text updated: \"${value}\"`);\n\nWithout backticks, this causes a syntax error."
    }
  ]
}
```

## Expected Performance Improvements

### 📈 **Success Metrics:**
- **Template literal syntax errors**: 100% → 0%
- **Complete HTML tag generation**: 60% → 95%
- **Svelte benchmark test pass rate**: 0% → 90%+
- **Consistent pattern usage**: Reliable template literal backticks

### 💰 **Cost Breakdown:**

| Provider | Training Cost | Inference Cost | Total (100 tests) |
|----------|---------------|----------------|-------------------|
| OpenAI   | $20-50        | $0.002/1K tokens | $25-55 |
| Gemini   | $10-30        | $0.001/1K tokens | $12-32 |
| Local    | Free          | Free             | Free |

### ⏱️ **Timeline:**
- **Data preparation**: 2-4 hours
- **Training time**: 1-8 hours (depending on provider)
- **Testing/validation**: 1-2 hours
- **Total project time**: 1-2 days

## Validation Against Original Failing Cases

The fine-tuned model will be tested against the exact prompts that failed in the original benchmark:

### Test Case 1: Basic $inspect with Custom Logging
```
Prompt: "Create a Svelte 5 component with $inspect that logs 'Text updated to: [value]' when text changes"

Before Fine-tuning ❌:
console.log(Text updated to: "${value}");  // Missing backticks

After Fine-tuning ✅:
console.log(`Text updated to: "${value}"`);  // Correct backticks
```

### Test Case 2: $inspect.trace with Effects
```
Prompt: "Create $inspect.trace with effect that logs character count"

Before Fine-tuning ❌:
console.log(The text is now: "${text}" (${text.length} characters));  // Missing backticks

After Fine-tuning ✅:
console.log(`The text is now: "${text}" (${text.length} characters)`);  // Correct backticks
```

### Test Case 3: Complete Component Structure
```
Before Fine-tuning ❌:
<input   // Incomplete tag

After Fine-tuning ✅:
<input 
    data-testid="text-input" 
    id="text-input" 
    type="text" 
    bind:value={text} 
/>  // Complete tag with all attributes
```

## Why This Approach Works

1. **Specific Problem**: Template literal syntax is very learnable
2. **Clear Examples**: Perfect positive/negative training examples
3. **Repetitive Patterns**: Same errors occur consistently across models
4. **Domain Focus**: Svelte 5 specific context reduces confusion
5. **Measurable Results**: Easy to validate success with existing tests

## Next Steps After Fine-tuning

1. **Deploy fine-tuned model** to your benchmark testing system
2. **Update model configurations** to use fine-tuned model IDs
3. **Run full benchmark suite** to validate improvements
4. **Monitor performance** over time for any regression
5. **Consider additional fine-tuning** for other Svelte patterns if needed

## Troubleshooting

### Common Issues:

**Training data upload fails:**
- Check API key validity
- Ensure JSONL format is correct
- Verify file size limits (< 100MB for OpenAI)

**Fine-tuning job fails:**
- Review training data for format errors
- Check hyperparameters are within limits
- Ensure sufficient training examples (minimum 10)

**Model performance doesn't improve:**
- Add more diverse training examples
- Increase number of epochs
- Include more negative examples showing wrong patterns

**Local training runs out of memory:**
- Reduce batch size in training arguments
- Use gradient checkpointing
- Consider model quantization

### Getting Help:

1. **Check logs** in provider's dashboard
2. **Review test results** in `test_results.json`
3. **Compare model outputs** before/after fine-tuning
4. **Validate training data** format and content

---

This fine-tuning approach directly addresses the systemic template literal syntax issues found across multiple LLM providers and should result in dramatically improved Svelte 5 code generation quality.