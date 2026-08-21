---
slug: deepseek-harness-installation-guide
title: "DeepSeek Harness Installation Guide\nFrom Zero to Hero: A Step-by-Step Tutorial for Building AI Agents"
category: TUTORIALS
date: 2026.08.20
excerpt: A DeepSeek Harness installation tutorial designed for absolute beginners, covering everything from environment setup to the first run, with detailed instructions at every step.
tags: [DeepSeek, AI, Tutorial, Beginner]
sources:
  - DeepSeek Harness Official Website|https://www.deepseek.com/harness
  - DeepSeek Harness GitHub|https://github.com/deepseek-ai/deepseek-harness
  - DeepSeek Open Platform|https://platform.deepseek.com/
---

> This is a tutorial tailored specifically for computer novices. Even if you've never used a command line or written a single line of code, you can successfully install DeepSeek Harness by following this guide.

## What is DeepSeek Harness?

First, let's clarify what we are about to install.

**DeepSeek Harness** (abbreviated as `dsh`) is an open-source tool launched by [DeepSeek AI](https://deepseek.com). Its core philosophy is **"Everything is a Plugin"**—you can think of it as a "building block framework." The AI model is the core, while various capabilities (reading files, executing commands, web searching, etc.) are plugins that can be freely combined.

To use an analogy:

- The **AI Model** (e.g., DeepSeek-V4) is like a human brain.
- **DeepSeek Harness** is like giving that brain hands, feet, eyes, and various tools, enabling it not just to "think," but also to "act."

It is currently in the **Developer Preview** stage, meaning features are iterating rapidly, but it is already fully functional for normal use.

### What Can It Do?

- Help you write and modify code
- Help you read and edit files
- Help you execute command-line operations
- Help you search for web content
- Automatically complete complex multi-step tasks

### Why Choose It?

- **Open Source & Free**: Code is completely public under the MIT License.
- **Plugin-Based Design**: Install only the functionalities you need.
- **Domestic Team**: DeepSeek is a top-tier domestic AI company, offering documentation and community support in Chinese.

---

## Step 1: Install Node.js

DeepSeek Harness is written in TypeScript and requires Node.js to run. Don't worry; installing Node.js is very simple.

### 1.1 Download Node.js

1.  Open your browser and visit the [Node.js Official Website](https://nodejs.org/)
2.  You will see two download buttons; select the **LTS (Long Term Support)** version on the left.
3.  Clicking it will automatically start the download. Wait for it to complete.

> **What is LTS?** LTS stands for Long Term Support. This version is the most stable and suitable for general users.

### 1.2 Install Node.js (Windows Users)

1.  Locate the downloaded file (usually in the "Downloads" folder) and double-click to run it.
2.  When the installation wizard appears, click **Next**.
3.  Check **"I accept the terms in the License Agreement"** and click Next.
4.  Choose the installation path (**keeping the default is recommended**) and click Next.
5.  This step is important! Ensure **"Automatically install the necessary tools"** is checked, then click Next.
6.  Click **Install** to begin.
7.  Wait for the installation to finish, then click **Finish**.

### 1.3 Verify Successful Installation

Now let's check if Node.js is installed correctly.

1.  Press `Win + R` on your keyboard (the Win key is the one with the Windows logo).
2.  Type `cmd` in the popup box and press Enter.
3.  This opens a black window known as the "Command Prompt" (or terminal).
4.  Type the following command and press Enter:

```sh
node --version
```

5.  If you see a version number like `v20.11.0`, the installation was successful!

> **What if it says "'node' is not recognized as an internal or external command"?**
> This indicates Node.js wasn't correctly added to the system path. Solution:
>
> 1. Close the current Command Prompt window.
> 2. Open a new Command Prompt window.
> 3. If it still doesn't work, try restarting your computer and testing again.

---

## Step 2: Obtain a DeepSeek API Key

DeepSeek Harness requires an API Key to call DeepSeek's AI models. Think of this key as a "key" that proves you have permission to use DeepSeek's services.

### 2.1 Register a DeepSeek Account

1.  Open your browser and visit the [DeepSeek Open Platform](https://platform.deepseek.com/)
2.  Click the **"Register"** button on the page.
3.  Enter your phone number.
4.  Click "Get Verification Code," then enter the SMS code you receive.
5.  Set a password (a combination of letters and numbers is recommended for security and memorability).
6.  Click "Register" to complete the process.

### 2.2 Create an API Key

1.  Log in with your newly registered account.
2.  You will enter the console dashboard after logging in.
3.  Find the **"API Keys"** option (usually in the left sidebar or top navigation).
4.  Click **"Create New Key"**.
5.  Give the key a name, such as `my-dsh-key` (for easier identification later).
6.  Click Confirm.

### 2.3 Save Your API Key

**This step is extremely important!**

1.  After creation, the page will display your API Key (a long string of letters and numbers).
2.  **Immediately copy this Key and save it in a secure location.**
3.  You **cannot view this Key again** once you close the page.

> **Tip:** You can save the Key in your phone's notes app or a computer notepad, but never share it with others.

### 2.4 Understanding Models and Costs

DeepSeek currently offers two flagship models:

| Model                 | Features                     | Suitable Scenarios                      |
| :-------------------- | :--------------------------- | :-------------------------------------- |
| **DeepSeek-V4-Flash** | Fast speed, low cost         | Daily use, learning & testing           |
| **DeepSeek-V4-Pro**   | Stronger capability, smarter | Complex tasks, professional development |

#### API Endpoints

- **OpenAI Format**: `https://api.deepseek.com`
- **Anthropic Format**: `https://api.deepseek.com/anthropic`

#### Pricing Details

| Billing Item                      | DeepSeek-V4-Flash      | DeepSeek-V4-Pro        |
| :-------------------------------- | :--------------------- | :--------------------- |
| **Input (Cache Hit) - Off-Peak**  | ¥0.05 / million tokens | ¥0.15 / million tokens |
| **Input (Cache Hit) - Peak**      | ¥0.10 / million tokens | ¥0.30 / million tokens |
| **Input (Cache Miss) - Off-Peak** | ¥1.5 / million tokens  | ¥4.5 / million tokens  |
| **Input (Cache Miss) - Peak**     | ¥3.0 / million tokens  | ¥9.0 / million tokens  |
| **Output - Off-Peak**             | ¥4.5 / million tokens  | ¥13.5 / million tokens |
| **Output - Peak**                 | ¥9.0 / million tokens  | ¥27.0 / million tokens |

> **Money-Saving Tip:** Try to use the service during off-peak hours; prices are half the cost compared to peak times.
>
> **Peak hours are 9:00 AM - 12:00 PM and 2:00 PM - 6:00 PM (Beijing Time, UTC+8).** All other times are off-peak.

---

## Step 3: Install DeepSeek Harness

With everything ready, let's install the star of the show!

### Method 1: Quick Start (Recommended for Beginners)

This is the simplest method, requiring only one command.

1.  Open Command Prompt (Press `Win + R`, type `cmd`, hit Enter).
2.  Enter the following command and press Enter:

```sh
npx @deepseek-ai/dsh web
```

3.  The first run will automatically download necessary files, which may take a few minutes.
4.  When you see output similar to the following, startup was successful:

```
[INFO] Server listening on http://127.0.0.1:3080
```

5.  Your browser should open automatically. If not, manually enter `http://127.0.0.1:3080` in your browser's address bar.

> **What is npx?** npx is a tool included with Node.js that allows you to run npm packages without installing them globally. No extra installation is needed.

### Method 2: Install from Source (For Advanced Users)

Choose this method if you want to inspect the source code or perform secondary development.

#### 2.1 Install Git

Git is a version control tool used to download source code.

1.  Visit the [Git Official Website](https://git-scm.com/)
2.  Download the version corresponding to your system (Windows users select Windows).
3.  Keep default options during installation and click Next throughout.

After installation, reopen Command Prompt and type:

```sh
git --version
```

Seeing a version number confirms successful installation.

#### 2.2 Install pnpm

pnpm is a package manager used to install project dependencies.

In Command Prompt, type:

```sh
npm install -g pnpm
```

Wait for installation to complete, then verify:

```sh
pnpm --version
```

#### 2.3 Download Source Code and Install

Enter the following commands sequentially (press Enter after each line):

```sh
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
```

> **Note:** `pnpm install` and `pnpm run build` may take some time. This is normal; please be patient.

#### 2.4 Start

```sh
pnpm dsh web
```

### Method 3: Using Python SDK (For Developers)

If you are familiar with Python, you can also use the Python version.

#### 3.1 Install Python

If you haven't installed Python yet:

1.  Visit the [Python Official Website](https://www.python.org/downloads/)
2.  Download the latest version.
3.  **Make sure to check "Add Python to PATH" during installation.**
4.  Complete the installation.

#### 3.2 Install SDK

```sh
python -m pip install deepseek-harness-sdk
```

#### 3.3 Create Test Script

Use Notepad to create a file named `test.py` with the following content:

```python
from deepseek_harness import DeepSeekHarness

with DeepSeekHarness() as harness:
    result = harness.run("Say hello to the world.")
    print(result)
```

Then run it in Command Prompt:

```sh
python test.py
```

---

## Step 4: Configuration and Usage

After starting up, you need to configure the API Key before usage.

### 4.1 Configure API Key

In the Web Interface:

1.  Find the settings entry (usually in a corner or sidebar).
2.  Locate the "API Key" configuration field.
3.  Paste the API Key you saved earlier.
4.  Save settings.

### 4.2 Select Operating Mode

DeepSeek Harness offers four modes:

| Mode                | Target Audience | Features                                               |
| :------------------ | :-------------- | :----------------------------------------------------- |
| **Standard Mode**   | General Users   | Most comprehensive features; recommended for beginners |
| **PTC Mode**        | Developers      | Allows combining multi-step operations via code        |
| **Minimalist Mode** | Testers         | Retains only basic functions for testing purposes      |
| **Creative Mode**   | Developers      | Enables creation of custom Agents                      |

**Beginners are advised to choose "Standard Mode".**

> **Model Selection Advice:**
>
> - If using **DeepSeek-V4-Flash**, **Standard Mode** is recommended for a complete experience.
> - If using **DeepSeek-V4-Pro**, **Minimalist Mode** is suggested. Due to potential overfitting issues in V4-Pro's post-training phase, Minimalist Mode provides only bash and file editing tools, which actually helps the model better leverage its reasoning capabilities.

### 4.3 Start Using

Enter your questions or tasks in the input box, such as:

- "Help me write a Python calculator"
- "Explain what Docker is"
- "Help me create a simple webpage"
- "Read this file and summarize the content"

Press Enter and wait for the AI response.

---

## Troubleshooting Common Issues

### Issue 1: Command Prompt Says "'command' is not recognized..."

**Possible Cause:** Software not installed correctly or not added to system environment variables.

**Solution:**

1.  Reinstall Node.js / Python / Git.
2.  Close and reopen Command Prompt after installation.
3.  Restart your computer if the issue persists.

### Issue 2: Port 3080 Occupied

**Solution:**

```sh
# Specify another port to start
npx @deepseek-ai/dsh web --port 3081
```

Then access `http://127.0.0.1:3081`

### Issue 3: Invalid API Key

**Checklist:**

1.  Was the API Key copied correctly (no extra spaces)?
2.  Is there sufficient balance in the account?

### Issue 4: Browser Did Not Open Automatically

No problem. Manually open your browser and enter:

```
http://127.0.0.1:3080
```

---

## Advanced Learning

Once you have successfully run DeepSeek Harness, continue exploring:

### Official Resources

- [DeepSeek Harness Official Website](https://www.deepseek.com/harness)
- [GitHub Repository](https://github.com/deepseek-ai/deepseek-harness)
- [API Documentation](https://platform.deepseek.com/api-docs)
- [DeepSeek Open Platform](https://platform.deepseek.com/)

### Plugin Exploration

The power of DeepSeek Harness lies in its plugin system. You can:

- Browse community plugins
- Learn how to develop your own plugins
- Combine different plugins based on specific needs

### Community Participation

- Submit issues and suggestions on [GitHub Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions)
- Join official communities (WeCom groups, [Discord](https://discord.gg/Ycq5dCaS4))
- Follow the WeChat Official Account for latest updates

---

## Summary

Congratulations! If you've followed this tutorial to this point, you have successfully installed and run DeepSeek Harness.

Let's recap what we did:

1.  Installed the Node.js runtime environment
2.  Registered a DeepSeek account and obtained an API Key
3.  Installed and started DeepSeek Harness
4.  Configured the API Key and began usage

Next, feel free to explore the world of AI agents and let them assist you with various tasks.

If you encounter any problems during use, please leave a comment below or ask questions on [GitHub Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions).

**Have fun!**
