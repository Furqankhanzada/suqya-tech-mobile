import React from 'react';
import { Svg, Path } from 'react-native-svg';

const Logo = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={100}
      height={100}
      viewBox="0 0 25.906 25.906"
      {...props}
    >
      <Path
        d="M12.953 0s-9 10.906-9 16.906c0 4.971 4.029 9 9 9s9-4.029 9-9c0-6-9-16.906-9-16.906zM9.026 17.496c0 1.426.668 4.25 1.134 5.426-3.042-1.494-3.846-4.425-3.846-6.463 0-3.173 3.684-7.824 5.777-12.149-.23 2.271-3.065 8.867-3.065 13.186z"
        fill="#030104"
      />
    </Svg>
  );
};

export default Logo;
