import { Variants } from 'framer-motion';

export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

export const itemVariants: Variants = {
    hidden: { 
        opacity: 0, 
        y: 20,
        scale: 0.95
    },
    visible: { 
        opacity: 1, 
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

export const hapticHover: Variants = {
    hover: { 
        scale: 1.02,
        y: -4,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 10
        }
    },
    tap: { 
        scale: 0.98,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 10
        }
    }
};

export const pulseVariant: Variants = {
    animate: {
        opacity: [0.4, 0.7, 0.4],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};
