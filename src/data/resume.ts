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
    campaign?: string;
    contest: string;
    event: string;
    results: Array<{ tier: string; scope: string }>;
  }>;
  focus: string[];
  contact: {
    label: string;
    handle: string;
    href: string;
    wechat?: string;
  };
}

export const resume: Resume = {
  about:
    "High-school student building at the intersection of code, design, photography, and essays on Mao Zedong's Selected Works. Reach me on WeChat: evervdev.",
  birthYear: 2011,
  education: {
    role: "Student",
    // \n = explicit editorial line break for the giant display line
    school: "Kunshan Bailu\nSenior High\nSchool",
    location: "Kunshan, Jiangsu",
  },
  awards: [
    {
      // campaign = national umbrella name (small kicker); contest = the
      // competition name that owns the giant hero lines; event = the track.
      campaign: 'China "Chip" Powers China Dream',
      contest:
        "National Youth\nCommunication Technology\nInnovation Competition",
      event: "Zhenxin Tech · Communication Intelligence Innovation Contest",
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
    wechat: "evervdev",
  },
};
