export type Trigger = {
  id: string;
  title: string;
  sub: string;
  trad: string;
  build: number;
  gloss: string;
  builder: string;
  why: string;
  steps: string[];
  prompt: string;
  timebox: string;
  skip: string | null;
  scenario: string;
  scenAppetite: string;
  scenPhase: string;
};

export const TRIGGERS: Trigger[] = [
  {
    id: "brief",
    title: "A new brief landed",
    sub: "Fresh client work just hit your desk.",
    trad: "Hypothesis and assumption identification",
    build: 6,
    gloss: "Read the brief, write a one-page summary, and book a kickoff to align stakeholders.",
    builder:
      "Before kickoff, build a rough prototype of the brief's riskiest assumption, so the first conversation starts from something working.",
    why: "Clients pay to reduce risk. Testing the hardest assumption in week one surfaces problems earlier and cheaper than a document review.",
    steps: [
      "Identify the single assumption that, if wrong, breaks the brief.",
      "Use an AI build tool to mock the thinnest version of it.",
      "Bring it to kickoff as an open question, not a finished answer.",
    ],
    prompt:
      "Here is a client brief: [paste]. Identify the single riskiest unproven assumption, then give me a step-by-step plan to prototype only that assumption in under a day.",
    timebox: "Half a day",
    skip: "This client expects a clear written plan before anything is built. Lead with the one-pager, name the risk in writing, and prototype once you have agreement.",
    scenario:
      "A mid-market insurer wants a 'customer portal refresh'. The brief is two pages, light on outcomes and heavy on features, and mentions 'AI-powered' twice without saying what for.",
    scenAppetite: "pragmatic",
    scenPhase: "discovery",
  },
  {
    id: "discovery",
    title: "Kicking off discovery",
    sub: "Starting to work out what's really needed.",
    trad: "Using qualitative data",
    build: 4,
    gloss:
      "Schedule interviews, run a workshop, and synthesise findings into themes over a couple of weeks.",
    builder:
      "Use AI to pre-synthesise the inputs you already have, then use interviews to test where the synthesis is wrong rather than starting from zero.",
    why: "The client sees a direction sooner, and interview time goes to the gaps that matter instead of re-covering known ground.",
    steps: [
      "Gather existing inputs: notes, transcripts, support tickets, analytics.",
      "Have AI cluster them into themes and flag the weakest-supported claims.",
      "Plan interviews to probe those weak points specifically.",
    ],
    prompt:
      "Here are our existing research inputs: [paste]. Cluster them into candidate problem themes. For each, rate how strong the evidence is and what you would verify with a real user.",
    timebox: "One afternoon",
    skip: "If this client measures discovery rigour in fieldwork hours, run the standard process and use AI in the background. Do not present AI synthesis as the headline.",
    scenario:
      "A retail bank is six weeks into a savings-app rebuild. There are 40 user interviews already done but never synthesised, plus 18 months of app-store reviews nobody has read.",
    scenAppetite: "pragmatic",
    scenPhase: "discovery",
  },
  {
    id: "aifeature",
    title: "Scoping an AI feature",
    sub: "Something model-driven is on the roadmap.",
    trad: "Articulating requirements",
    build: 8,
    gloss:
      "Write user stories and acceptance criteria, hand them to engineering, and treat the feature working as done.",
    builder:
      "Write the quality bar first: define what good and bad model outputs look like before scoping, because that is what will fail in production.",
    why: "An AI feature that demos well but fails on real inputs erodes client trust fast. A defined quality bar is what makes it shippable, not just demoable.",
    steps: [
      "Collect 10 real inputs the feature will face, including messy and edge cases.",
      "Write an acceptable and an unacceptable output for each.",
      "Make that set the definition of done and re-run it on every model change.",
    ],
    prompt:
      "We are building [feature] using an LLM. Help me draft an evaluation set: 10 representative inputs including edge and adversarial cases, each with a clear pass or fail standard for the output.",
    timebox: "1 to 2 hours",
    skip: "If this is only a proof of concept for a board demo, a full eval set is premature. Build the demo, but document the quality work production would require.",
    scenario:
      "A logistics client wants an 'AI assistant' in their dispatcher tool to suggest route changes. No one has defined what a good vs bad suggestion looks like, and the dispatchers are sceptical.",
    scenAppetite: "conservative",
    scenPhase: "definition",
  },
  {
    id: "stuck",
    title: "Stuck on a problem",
    sub: "Spinning on something and need a way through.",
    trad: "Ideation",
    build: 9,
    gloss: "Sit with it, ask a colleague, write it up, and bring it to the next team meeting.",
    builder:
      "Use AI to reframe the problem three ways you have not tried, then keep only the framing that holds up against your real constraints.",
    why: "Unblocking in an hour instead of waiting for the next meeting keeps delivery moving, which is what the client is paying for.",
    steps: [
      "State the problem and what you have already ruled out.",
      "Ask AI for three different framings of the problem, not solutions.",
      "Test each against your real constraints and discard the ones that fail.",
    ],
    prompt:
      "I am stuck on this: [describe]. I have already tried [X]. Give me three different ways to frame this problem, and for each, the strongest objection to it.",
    timebox: "1 hour",
    skip: null,
    scenario:
      "You've been asked to cut a roadmap from nine months to five without dropping the headline feature, and every option you've drafted just moves the pain somewhere else.",
    scenAppetite: "pragmatic",
    scenPhase: "delivery",
  },
  {
    id: "update",
    title: "Prepping a client update",
    sub: "Pulling together what to tell the client.",
    trad: "Managing stakeholders",
    build: 5,
    gloss: "Build a status deck covering what is done, what is next, and current risks.",
    builder:
      "Draft the update from your raw notes with AI, then spend the saved time on the one decision or recommendation the client needs from you.",
    why: "Clients value a clear recommendation more than a formatted deck. Less time on formatting, more on the judgement only you can provide.",
    steps: [
      "Paste your raw notes, tickets, and metrics.",
      "Have AI draft the update in your standard format.",
      "Edit for accuracy, then add the recommendation only you can make.",
    ],
    prompt:
      "Here are my raw project notes for this week: [paste]. Draft a concise client status update covering progress, next steps, and risks. Leave a clear gap for my recommendation.",
    timebox: "20 minutes",
    skip: "This client reads updates closely and values a personal tone. Use AI to draft, but make the final judgement and wording visibly yours.",
    scenario:
      "It's Thursday, the steering committee is tomorrow, and you have three Slack threads, a metrics dashboard, and a delivery risk you haven't told them about yet.",
    scenAppetite: "ambitious",
    scenPhase: "delivery",
  },
];

export function triggerById(id: string): Trigger | undefined {
  return TRIGGERS.find((t) => t.id === id);
}

export const builderToTrigger: Record<number, string> = {
  4: "discovery",
  5: "update",
  6: "brief",
  7: "aifeature",
  8: "aifeature",
  9: "stuck",
};

export const APPETITE: [string, string, string][] = [
  ["conservative", "Conservative", "Wants proven process, wary of new methods."],
  ["pragmatic", "Pragmatic", "Open to better ways if the value is clear."],
  ["ambitious", "Ambitious", "Actively wants to push how things are done."],
];
