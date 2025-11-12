#!/usr/bin/env python3
"""
Quick setup script for OpenAI API Key
"""
import os
from pathlib import Path

def setup_openai_key():
    """Interactive setup for OpenAI API key"""
    print("=" * 60)
    print("DASA Hospitality - OpenAI API Key Setup")
    print("=" * 60)
    print()
    
    # Get the backend directory
    backend_dir = Path(__file__).parent
    env_file = backend_dir / '.env'
    
    # Check if .env exists
    if not env_file.exists():
        print("❌ Error: .env file not found!")
        print(f"Expected location: {env_file}")
        return
    
    # Read current .env
    with open(env_file, 'r') as f:
        env_content = f.read()
    
    # Check if API key is already set
    if 'OPENAI_API_KEY=' in env_content:
        if 'your_openai_api_key_here' not in env_content:
            print("✅ OpenAI API key is already configured!")
            print()
            response = input("Do you want to update it? (y/n): ").lower()
            if response != 'y':
                print("Setup cancelled.")
                return
    
    # Get API key from user
    print("\n📝 Steps to get your OpenAI API key:")
    print("1. Go to: https://platform.openai.com/api-keys")
    print("2. Sign in or create an account")
    print("3. Click 'Create new secret key'")
    print("4. Copy the key (starts with 'sk-')")
    print()
    
    api_key = input("Enter your OpenAI API key: ").strip()
    
    # Validate API key format
    if not api_key:
        print("❌ Error: API key cannot be empty!")
        return
    
    if not api_key.startswith('sk-'):
        print("⚠️  Warning: OpenAI API keys usually start with 'sk-'")
        response = input("Continue anyway? (y/n): ").lower()
        if response != 'y':
            print("Setup cancelled.")
            return
    
    # Update .env file
    if 'OPENAI_API_KEY=' in env_content:
        # Replace existing key
        lines = env_content.split('\n')
        new_lines = []
        for line in lines:
            if line.startswith('OPENAI_API_KEY='):
                new_lines.append(f'OPENAI_API_KEY={api_key}')
            else:
                new_lines.append(line)
        new_content = '\n'.join(new_lines)
    else:
        # Add new key
        new_content = env_content + f'\n\nOPENAI_API_KEY={api_key}\n'
    
    # Write back to .env
    with open(env_file, 'w') as f:
        f.write(new_content)
    
    print()
    print("=" * 60)
    print("✅ OpenAI API key has been saved successfully!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Run test: python test_openai.py")
    print("2. Start server: python main.py")
    print()

if __name__ == "__main__":
    try:
        setup_openai_key()
    except KeyboardInterrupt:
        print("\n\nSetup cancelled by user.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
