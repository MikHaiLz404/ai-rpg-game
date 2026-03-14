#!/bin/bash
# Dialogue Generator using Gemini

echo "🎭 Gods' Arena - Dialogue Generator"
echo "===================================="
echo ""

# Get input
read -p "Character ID: " char_id
read -p "Character Name (TH): " char_name
read -p "Number of dialogues: " num_dlg

# Generate prompt for Gemini
PROMPT="Create $num_dlg dialogue nodes for a game character '$char_name' (ID: $char_id) in Thai.

Output as JSON array with this structure:
[{
  \"id\": \"intro\",
  \"textTH\": \"Thai dialogue\",
  \"textEN\": \"English translation\",
  \"choices\": [
    {\"textTH\": \"choice 1\", \"textEN\": \"choice 1 EN\", \"nextId\": \"next_node_id\", \"bondChange\": 5}
  ]
}]

Make it natural conversation for a shopkeeper game. Character personality:"

read -p "Character personality (shy/friendly/serious/etc): " personality

PROMPT="$PROMPT $personality"

echo ""
echo "📝 Prompt for Gemini:"
echo "$PROMPT"
echo ""

read -p "Press Enter to open Gemini CLI, or 's' to skip..."

if [ "$1" != "s" ]; then
  # This would open Gemini CLI - for now just echo the prompt
  echo "➡️  Copy prompt above and paste to Gemini CLI"
fi
