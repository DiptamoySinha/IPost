import { Loader } from "@/components/shared";
import GridPostList from "@/components/shared/GridPostList";
import { useGetAllPostByIds, useGetCurrentUser } from "@/lib/react-query/queriesAndMutation"
import { Models } from "appwrite";

export default function Saved() {

  const {data: currentUser} = useGetCurrentUser();
  const savePostId = currentUser?.save?.map((savePost: Models.Document) => savePost.post.$id)
  const {data: allSavedPost} = useGetAllPostByIds(savePostId)
  const savedPosts = allSavedPost?.documents;

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <img
          src="/assets/icons/save.svg"
          width={36}
          height={36}
          alt="edit"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
      </div>

      {!currentUser ? (
        <Loader />
      ) : (
        <ul className="w-full flex justify-center max-w-5xl gap-9">
          {savedPosts?.length === 0 ? (
            <p className="text-light-4">No available posts</p>
          ) : (
            <GridPostList posts={savedPosts} showStats={true} showUser={true}/>
          )}
        </ul>
      )}
    </div>
  )
}
