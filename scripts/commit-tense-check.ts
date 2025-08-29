import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY as string;

if (!apiKey || apiKey.trim() === '') {
  console.error(
    '\x1b[31m❌ GOOGLE_GENERATIVE_AI_API_KEY is missing or invalid in .env file.\x1b[0m',
  );
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const commitMessageFile = process.argv[2];

if (!commitMessageFile) {
  console.error('\x1b[31m❌ Please provide a commit message file path.\x1b[0m');
  process.exit(1);
}

function getCommitMessage(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf8').trim();
  } catch {
    throw new Error(`Error reading commit message file: ${filePath}`);
  }
}
async function isPastTense(text: string): Promise<boolean> {
  const prompt = `Determine if the following text is in past tense:\n\n"${text}"\n\nRespond with "yes" or "no"`;
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return /yes/i.test(response.text());
  } catch {
    throw new Error('Error while contacting AI model.');
  }
}
async function suggestPresentTenseMessage(text: string): Promise<string> {
  const prompt = `The following commit message is in past tense: "${text}".
  Suggest a corrected version written in present tense and imperative mood.
  It should start with a lowercase verb and follow the conventional commit format (e.g., feat(auth): add login).
  Do not use capital letters unless required for acronyms.
  Respond with only the corrected message.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text().trim();
  } catch {
    throw new Error('Could not generate a suggestion.');
  }
}

(async (): Promise<void> => {
  try {
    const message = getCommitMessage(commitMessageFile);
    const isPast = await isPastTense(message);

    if (isPast) {
      const suggestion = await suggestPresentTenseMessage(message);
      console.warn('\x1b[33m💡 Suggested fix:\x1b[0m', suggestion);
      process.exit(1);
    }

    console.warn('\x1b[32m✅ Commit message passed.\x1b[0m');
    process.exit(0);
  } catch (error: unknown) {
    if (error instanceof Error) console.error('\x1b[31m❌ Error:\x1b[0m', error.message);
    else console.error('\x1b[31m❌ Unknown error occurred.\x1b[0m');
    process.exit(1);
  }
})();
