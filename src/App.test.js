import { render } from '@testing-library/react';
import App from './App';

test('renders the empty app shell', () => {
  const { container } = render(<App />);
  expect(container.firstChild).toHaveClass('App');
});
