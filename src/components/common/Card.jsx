import React from 'react';
import './Components.css';
import { motion } from 'framer-motion';

export const Card = ({ 
  children, 
  className = '', 
  hoverable = false,
  ...props 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`card ${hoverable ? 'card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
