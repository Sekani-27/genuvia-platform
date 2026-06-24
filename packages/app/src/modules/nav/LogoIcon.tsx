import React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  text: {
    fill: '#7df3e1',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    fontWeight: 'bold',
  },
});

export const LogoIcon = () => {
  const classes = useStyles();
  return (
    <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="22" className={classes.text}>G</text>
    </svg>
  );
};
