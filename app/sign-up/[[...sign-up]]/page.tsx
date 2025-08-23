import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className='flex h-screen justify-center px-4 mt-12'>
      <SignUp />
    </div>
  );
}
