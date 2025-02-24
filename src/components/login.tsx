'use client'
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';

const LoginPage: React.FC = () => {
  // Create references for the input fields
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [password, setPassword] = useState<string>(''); // Store password input value
  const [isButtonEnabled, setIsButtonEnabled] = useState<boolean>(false); // Track button enable state
  const router = useRouter(); // To handle redirect

  // The correct password
  const correctPassword = 'AXNHTL';

  // Handle input change (move focus to next field)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    // Update password state when input changes
    const updatedPassword = [...inputRefs.current].map((ref) => ref?.value).join('');
    setPassword(updatedPassword);

    // Move to next input if there's text
    if (e.target.value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Enable button if password matches
    if (updatedPassword.length === correctPassword.length && updatedPassword === correctPassword) {
      setIsButtonEnabled(true);
    } else {
      setIsButtonEnabled(false);
    }
  };

  // Handle key down (move focus to previous field when backspace is pressed)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Move to previous input when backspace is pressed
    if (e.key === 'Backspace' && index > 0 && !inputRefs.current[index]?.value) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle form submit (redirect if password is correct)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    localStorage.setItem('login', 'done')

    // Check if the password is correct
    if (password === correctPassword) {
      // Redirect to the next screen (example: `/dashboard`)
      router.push('/home'); // Change the route as needed
    } else {
      alert('Incorrect password!');
    }
  };

  return (
    <div className="flex h-screen flex-col md:flex-row bg-primary">
      {/* Left side */}
      <div className="w-full md:w-[60%] bg-primary flex justify-center items-center p-8">
        <img className="max-w-[80%] md:max-w-[50%] h-auto" src="/axn_logo.png" alt="Login Image" />
      </div>

      {/* Right side */}
      <div className="w-full md:w-[40%] p-8 flex flex-col justify-center items-center bg-white rounded-t-3xl lg:rounded-none h-full">
        <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
        <p className="text-lg text-gray-600 mb-6 text-center">Enter passcode to sign in</p>

        <form className="w-full max-w-sm space-y-6" onSubmit={handleSubmit}> {/* Added more space between inputs and button */}
          {/* Generate 6 password inputs */}
          <div className="flex space-x-2 justify-center mb-6">
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                className="w-12 h-12 p-3 border border-gray-300 rounded-lg text-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="-"
                maxLength={1} // Only allow 1 character per input
                onChange={(e) => handleInputChange(e, index)} // Move to the next field
                onKeyDown={(e) => handleKeyDown(e, index)} // Move to the previous field when backspace is pressed
              />
            ))}
          </div>

          <button
            type="submit"
            className={`w-full p-3 ${isButtonEnabled ? 'bg-primary' : 'bg-gray-300'} text-white font-semibold rounded-lg hover:bg-red-600 transition-colors`}
            disabled={!isButtonEnabled} // Disable button if password is not correct
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
