import { Toaster } from "@/components/ui/toaster"
import { Routes, Route } from 'react-router-dom';

import SigninForm from './_auth/forms/SigninForm';
import SignupForm from './_auth/forms/SignupForm';
import {
  Home,
  Explore,
  Saved,
  CreatePost,
  Profile,
  EditPost,
  PostDetails,
  UpdateProfile,
  AllUsers,
} from './_root/pages';
import RootLayout from './_root/RootLayout';
import AuthLayout from  './_auth/AuthLayout';

import './globals.css';
import { homeLoader } from "./_root/pages/Home";


export default function App() {
  return (
    <main className="flex h-screen">
        <Routes>
          {/* public */}
          <Route element={<AuthLayout/>} >
            <Route path="/sign-in" element={<SigninForm/>} />
            <Route path="/sign-up" element={<SignupForm />} />
          </Route>
         
          {/* private */}
          <Route element={<RootLayout />}>
            <Route index element={<Home />} loader={homeLoader}/>
            <Route path="/explore" element={<Explore />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/all-users" element={<AllUsers />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/update-post/:id" element={<EditPost />} />
            <Route path="/posts/:id" element={<PostDetails />} />
            <Route path="/profile/:id/*" element={<Profile />} />
            <Route path="/update-profile/:id" element={<UpdateProfile />} />
          </Route>
        </Routes>
        <Toaster />
    </main>
  )
}
