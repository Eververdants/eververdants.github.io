import React from 'react';
import { motion } from 'framer-motion';

interface TagFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const TagFilter: React.FC<TagFilterProps> = ({ categories, selected, onSelect }) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
      {categories.map((category, index) => (
        <motion.button
          key={category}
          custom={index}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          onClick={() => onSelect(category)}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selected === category
              ? 'bg-forest-500 text-white shadow-sm'
              : 'bg-warm-100 dark:bg-warm-400/10 text-ink/70 dark:text-warm-50/70 hover:bg-warm-200 dark:hover:bg-warm-400/20'
          }`}
        >
          {category}
        </motion.button>
      ))}
    </div>
  );
};

export default TagFilter;
