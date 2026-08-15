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
    results: string[];
  }>;
  focus: string[];
  contact: {
    label: string;
    handle: string;
    href: string;
  };
}

export const resume: Resume = {
  about: "High-school student building at the intersection of code, design, and photography.",
  birthYear: 2011,
  education: {
    role: "Student",
    // \n = explicit editorial line break for the giant display line
    school: "Kunshan Bailu\nSenior High School",
    location: "Kunshan, Jiangsu",
  },
  awards: [
    {
      // \n = explicit editorial line break for the giant display line
      contest: "National Youth Communication\nTechnology Innovation\nCompetition",
      event: "Zhenxin Technology · Intelligent Communication Technology Innovation Contest",
      results: ["Jiangsu Provincial · First Prize", "National Finals · Third Prize"],
    },
  ],
  focus: [
    "Development",
    "Design",
    "Photography",
    "Gaming",
    "Digital Creation",
    "Self-Expression",
  ],
  contact: {
    label: "GitHub",
    handle: "Eververdants",
    href: "https://github.com/Eververdants",
  },
};
