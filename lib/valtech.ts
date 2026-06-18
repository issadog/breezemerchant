export type ValtechCompetency = {
  theme: string;
  levels: [string, string, string, string, string];
};

export const VALTECH: Record<string, ValtechCompetency> = {
  "Hypothesis and assumption identification": {
    theme: "Discovery",
    levels: [
      "I understand the components of good, testable hypotheses and assumptions and can develop them with some support.",
      "I can define a hypothesis, test criteria and underlying assumptions, articulate the value if proven, and lead a team in testing it.",
      "I can surface the many assumptions being made in pursuit of an outcome and prioritise which to test first based on risk to the client.",
      "I challenge stakeholders where they are making untested assumptions and work with them to expose what needs to be tested.",
      "I use a test-and-learn approach to influence senior stakeholders, and will make the case to stop work on a key bet if the evidence says so.",
    ],
  },
  "Using qualitative data": {
    theme: "Discovery",
    levels: [
      "I understand key qualitative concepts and techniques and can support with collection activities.",
      "I can identify the best technique and collect qualitative data with some support.",
      "I use many techniques depending on context, and use the data to communicate about users, their behaviour and needs.",
      "I influence stakeholders at all levels to collect qualitative data where it is missing and advise on best practice.",
      "I can set up research teams and embed best-practice qualitative techniques across a company.",
    ],
  },
  "Articulating requirements": {
    theme: "Execution",
    levels: [
      "I understand that requirements are a team sport, not a top-down exercise, and that their form should fit the setting.",
      "I work with a product team to agree the form and approach to requirements, playing a proactive role in their creation.",
      "I help sibling teams adopt requirements approaches that balance specific needs with consistency, to drive coordination.",
      "I coach PMs and other team members to mature and refine their approach to requirements and propagate best practice.",
      "I lead the introduction of new requirements approaches at an organisational level, including new methods and tooling.",
    ],
  },
  "Ideation": {
    theme: "Discovery",
    levels: [
      "I understand different ideation techniques and the roles required to run them, and can support ideation activities.",
      "I can pick the best ideation approach for my situation and run cross-functional sessions with some support.",
      "I am comfortable leading many types of ideation with cross-functional teams and wider stakeholder groups.",
      "I run ideation across the product lifecycle and use the insight to develop new opportunities for the company.",
      "I help C-suite stakeholders see the need for team-level ideation and foster cross-functional creativity across teams.",
    ],
  },
  "Managing stakeholders": {
    theme: "Consulting",
    levels: [
      "I can contribute to stakeholder mapping and understand the need to vary my communication approach.",
      "I identify the key stakeholders on my project and choose appropriate ways to communicate with them.",
      "I map everyone who can influence my project, categorise them by influence, and deliberately manage those relationships.",
      "I build and manage direct stakeholder relationships and influence outside my project where needed to keep work moving.",
      "I influence senior client stakeholders to further the work of my teams.",
    ],
  },
};
