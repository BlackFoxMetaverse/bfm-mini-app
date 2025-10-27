const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Updated API URL to use Gemini 2.0 Flash model
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * Generates a quiz with 10 questions based on selected topics
 * @param {string[]} topics - Array of topics selected by the user
 * @returns {Promise<Array>} - Array of question objects
 */
export async function generateQuiz(topics) {
  if (!GEMINI_API_KEY) {
    console.error(
      "Gemini API key not found. Set VITE_GEMINI_API_KEY in your environment variables.",
    );
    return mockQuiz(topics); // Fallback to mock data if API key is missing
  }

  try {
    const prompt = createQuizPrompt(topics);
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [   
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        // Specific parameters for better quiz generation performance
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Gemini API error:", data.error);
      return mockQuiz(topics); // Fallback to mock data
    }

    // Extract quiz data from response
    const quizText = data.candidates[0].content.parts[0].text;
    return parseQuizResponse(quizText);
  } catch (error) {
    console.error("Failed to generate quiz:", error);
    return mockQuiz(topics); // Fallback to mock data
  }
}

/**
 * Creates a prompt for Gemini API to generate quiz questions
 * @param {string[]} topics - Array of selected topics
 * @returns {string} - Formatted prompt string
 */
function createQuizPrompt(topics) {
  const topicsString = topics.join(", ");
  return `Generate exactly 5 multiple-choice questions about the following topics: ${topicsString}.

Format each question as:
{
  "text": "QUESTION TEXT IN ALL CAPS",
  "options": ["OPTION A", "OPTION B", "OPTION C", "OPTION D"],
  "correctAnswer": INDEX_OF_CORRECT_ANSWER_STARTING_FROM_0,
  "explanation": "2-3 sentences explaining why the correct answer is correct and why the others are wrong",
  "image": "Relevant image URL from Unsplash or Pixabay"
}

MANDATORY RULES:
1. Create 5 UNIQUE questions — no repetition of wording or concept.
2. Difficulty mix: 2 Easy, 2 Medium, 1 Challenging.
3. Correct answers must be RANDOMLY distributed among options A, B, C, and D.
   - Ensure that across the 5 questions, at least once the correct answer is A, at least once B, at least once C, and at least once D.
   - The remaining question can be assigned randomly to any option.
   - Do NOT follow a predictable sequence (like always A→B→C→D→X).
4. Explanations must clearly justify why the correct option is correct and why the others are wrong.
5. Every question must include a relevant image URL from Unsplash or Pixabay.
6. When relevant, incorporate Web3, Blockchain, or Metaverse aspects.
7. Output must be a single valid JSON array of 5 question objects (no extra text, no markdown, no comments).`;
}


/**
 * Parses the raw quiz response from Gemini into structured question objects
 * @param {string} quizText - Raw text response from Gemini
 * @returns {Array} - Formatted quiz questions
 */
function parseQuizResponse(quizText) {
  try {
    // Extract JSON array from the response
    const jsonMatch = quizText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      const questions = JSON.parse(jsonStr);

      // Add IDs and validate the questions
      return questions.map((q, index) => ({
        id: index + 1,
        text: q.text,
        options: q.options || ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
        explanation: q.explanation || "",
        image: q.image || null,
      }));
    }

    throw new Error("Could not parse JSON from response");
  } catch (error) {
    console.error("Failed to parse quiz response:", error);
    return []; // Return empty array if parsing fails
  }
}

/**
 * Generates mock quiz questions when API fails
 * @param {string[]} topics - Topics selected by user
 * @returns {Array} - Mock quiz questions
 */
function mockQuiz(topics) {
  // eslint-disable-next-line no-unused-vars
  const topicsString = topics.join(", ");

  return [
    {
      id: 1,
      text: `WHAT IS ONE OF THE KEY TECHNOLOGIES BEHIND ${topics[0] || "BLOCKCHAIN"}?`,
      options: [
        "DISTRIBUTED LEDGER",
        "FLOPPY DISKS",
        "VHS TAPES",
        "DIAL-UP INTERNET",
      ],
      correctAnswer: 0,
      explanation:
        "Distributed ledger technology is foundational to blockchain, allowing data to be stored across multiple nodes rather than in a single central location.",
      image:
        "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&auto=format&fit=crop",
    },
    {
      id: 2,
      text: `WHICH OF THESE CRYPTOCURRENCY PROJECTS FOCUSES ON SMART CONTRACTS?`,
      options: ["BITCOIN", "ETHEREUM", "DOGECOIN", "LITECOIN"],
      correctAnswer: 1,
      explanation:
        "Ethereum was the first blockchain platform to introduce robust smart contract functionality, enabling developers to build decentralized applications (dApps).",
      image:
        "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&auto=format&fit=crop",
    },
    {
      id: 3,
      text: `IN THE CONTEXT OF ${topics[2] || "NFT"}, WHAT DOES NFT STAND FOR?`,
      options: [
        "NON-FUNGIBLE TOKEN",
        "NEW FILE TYPE",
        "NETWORK FILE TRANSFER",
        "NATIVE FUNCTION TOKEN",
      ],
      correctAnswer: 0,
      explanation:
        "NFT stands for Non-Fungible Token, representing unique digital assets. Unlike cryptocurrencies where each token is identical, NFTs have unique properties making them distinct from one another.",
      image:
        "https://images.unsplash.com/photo-1645937367476-bbeaa0184edb?w=800&auto=format&fit=crop",
    },
    {
      id: 4,
      text: `WHICH COMPANY REBRANDED TO FOCUS ON THE ${topics[3] || "METAVERSE"} DEVELOPMENT?`,
      options: ["GOOGLE", "APPLE", "META (FORMERLY FACEBOOK)", "AMAZON"],
      correctAnswer: 2,
      explanation:
        "Facebook rebranded as Meta in October 2021, signaling its strategic shift toward developing metaverse technologies and experiences.",
      image:
        "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&auto=format&fit=crop",
    },
    {
      id: 5,
      text: `WHAT IS A KEY CHARACTERISTIC OF ${topics[0] || "BLOCKCHAIN"} TECHNOLOGY?`,
      options: [
        "CENTRALIZATION",
        "IMMUTABILITY",
        "RAPID CHANGEABILITY",
        "REQUIRED PERSONAL IDENTIFICATION",
      ],
      correctAnswer: 1,
      explanation:
        "Immutability is a fundamental property of blockchain, meaning once data is recorded, it cannot be altered or deleted. This creates a permanent, tamper-evident record of transactions.",
      image:
        "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&auto=format&fit=crop",
    },
    {
      id: 6,
      text: `WHICH PROGRAMMING LANGUAGE IS COMMONLY USED FOR ${topics[1] || "SMART CONTRACTS"} ON ETHEREUM?`,
      options: ["PYTHON", "JAVA", "C++", "SOLIDITY"],
      correctAnswer: 3,
      explanation:
        "Solidity is the primary language developed specifically for writing smart contracts on Ethereum. Its syntax is similar to JavaScript but designed for blockchain functionality.",
      image:
        "https://images.unsplash.com/photo-1639322538015-b9271ae23452?w=800&auto=format&fit=crop",
    },
    {
      id: 7,
      text: `WHAT TECHNOLOGY ENABLES AUGMENTED REALITY IN ${topics[2] || "AR"} APPLICATIONS?`,
      options: [
        "COMPUTER VISION",
        "BLOCKCHAIN",
        "5G ONLY",
        "QUANTUM COMPUTING",
      ],
      correctAnswer: 0,
      explanation:
        "Computer vision allows devices to 'see' and interpret the real world, which is essential for AR applications to accurately place digital elements in physical space.",
      image:
        "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&auto=format&fit=crop",
    },
    {
      id: 8,
      text: `WHICH OF THESE IS NOT A ${topics[3] || "WEB3"} CHARACTERISTIC?`,
      options: [
        "DECENTRALIZATION",
        "USER OWNERSHIP",
        "CENTRALIZED CONTROL",
        "TOKENIZATION",
      ],
      correctAnswer: 2,
      explanation:
        "Centralized control directly contradicts Web3's core philosophy. Web3 emphasizes decentralization and user ownership, moving away from the centralized platforms that dominate Web2.",
      image:
        "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=800&auto=format&fit=crop",
    },
    {
      id: 9,
      text: `WHAT IS REQUIRED TO JOIN A PUBLIC ${topics[0] || "BLOCKCHAIN"} NETWORK?`,
      options: [
        "A GOVERNMENT LICENSE",
        "A CREDIT CARD",
        "A NODE",
        "A UNIVERSITY DEGREE",
      ],
      correctAnswer: 2,
      explanation:
        "Anyone can join a public blockchain network by running a node that maintains a copy of the ledger and participates in the consensus process. This openness is fundamental to blockchain's decentralized nature.",
      image:
        "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=800&auto=format&fit=crop",
    },
    {
      id: 10,
      text: `WHICH IS AN APPLICATION OF ${topics[1] || topics[0] || "AI"} IN DECENTRALIZED FINANCE?`,
      options: [
        "MANUAL BOOKKEEPING",
        "AUTOMATED TRADING",
        "PAPER RECEIPTS",
        "IN-PERSON ONLY BANKING",
      ],
      correctAnswer: 1,
      explanation:
        "AI enables automated trading in DeFi by analyzing market patterns, optimizing liquidity pools, and executing trades based on predefined algorithms without human intervention.",
      image:
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop",
    },
  ];
}
