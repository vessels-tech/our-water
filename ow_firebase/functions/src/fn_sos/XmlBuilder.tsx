import * as React from 'react';
import { render } from 'jsx-to-html';

export function testTsx() {
  
  return render(
    <div className="Hello World">Hello World</div>
  );
}