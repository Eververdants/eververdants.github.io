/* Resume content for the second screen. Keep copy here, layout in
   ResumeScene.tsx, so editing text never touches markup. */

export interface Resume {
  about: string;
  birthYear: number;
  education: {
    role: string;
    school: string;
    location: string;
  };
  awards: Array<{
    contest: string;
    event: string;
    results: Array<{ tier: string; scope: string }>;
  }>;
  focus: string[];
  contact: {
    label: string;
    handle: string;
    href: string;
  };
}

export const resume: Resume = {
  about: "High-school student building at the intersection of code, design, photography, and essays on Mao Zedong's Selected Works.",
  birthYear: 2011,
  education: {
    role: "Student",
    // \n = explicit editorial line break for the giant display line
    school: "Kunshan Bailu\nSenior High\nSchool",
    location: "Kunshan, Jiangsu",
  },
  awards: [
    {
      // \n = explicit editorial line break for the giant display line.
      // Three lines (2/2/2 rhythm) read as a ceremony title card; five
      // lines felt like a dense block.
      contest:
        "National Youth\nCommunication Technology\nInnovation Competition",
      // 振芯科技 puns 振兴 (revive): RevCore = Rev(e)+Core(芯), same trick in English.
      event: "RevCore Technology · Intelligent Communication Technology Innovation Contest",
      // rank (tier) is the giant display line; scope is the small detail line.
      results: [
        { tier: "First Prize", scope: "Jiangsu Provincial" },
        { tier: "Third Prize", scope: "National Finals" },
      ],
    },
  ],
  focus: [
    "Development",
    "Design",
    "Photography",
    "Calligraphy",
    "Gaming",
    "Digital Creation",
    "Chinese Literature",
    "Self-Expression",
  ],
  contact: {
    label: "GitHub",
    handle: "Eververdants",
    href: "https://github.com/Eververdants",
  },
};
