import { useDeleteSavePost, useGetCurrentUser, useLikePost, useSavePost } from "@/lib/react-query/queriesAndMutation"
import { checkIsLiked } from "@/lib/utils";
import { Models } from "appwrite"
import React, { useEffect, useState } from "react";
import Loader from "./Loader";

type postStatsProp = {
    post: Models.Document,
    userId: string
}

export default function PostStats({post, userId}: postStatsProp) {
    const likeList = post.likes.map((user: Models.Document) => user.$id);
    // console.log(`${post.caption} => ${likeList.length}`)
    const [likes, setLikes] = useState(likeList);

    const[isSave, setIsSave] = useState(false);

    const {mutate: likePost} = useLikePost();
    const {mutate: savePost} = useSavePost();
    const {mutate: deleteSavePost, isPending: isSaveDeleting} = useDeleteSavePost();

    const {data: currentUser, isLoading: isUserLoading} = useGetCurrentUser();
    const savePostRecord = currentUser?.save.find((record: Models.Document) => record.post.$id === post.$id);

    useEffect(() => {
        setLikes(likeList);
    }, [likeList.length])

    useEffect(() => {
        setIsSave(!!savePostRecord)
    }, [currentUser])


    function handleLikePost(e: React.MouseEvent) {
        e.stopPropagation();

        let newlikes = [...likes];
        const hasLiked = newlikes.includes(userId);

        if(hasLiked){
             newlikes = newlikes.filter(id => id !== userId);
        }
        else{
            newlikes.push(userId);
        }

        setLikes(newlikes);
        likePost({postId: post.$id, likesArray: newlikes});
    }

    function handleSavePost(e: React.MouseEvent) {
        e.stopPropagation();

        if(savePostRecord)
        {
            setIsSave(false);
            deleteSavePost(savePostRecord.$id)
            return;
        }
        savePost({postId: post.$id, userId});
        setIsSave(true);
    }
    return (
        <div className="flex justify-between items-center z-20">
            <div className="flex gap-2 mr-5">
                <img src={checkIsLiked(likes, userId) ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"} 
                alt="like" 
                width={20}
                height={20}
                onClick={handleLikePost}
                className="cursor-pointer"
                />
                <p className="small-medium lg:base-medium">{likes.length}</p>
                    
            </div>

            <div className="flex gap-2 ">
                {(isUserLoading || isSaveDeleting) && <Loader/>}
                {(!isUserLoading || isSaveDeleting) && <img src={isSave ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
                    alt="like" 
                    width={20}
                    height={20}
                    onClick={handleSavePost}
                    className="cursor-pointer"
                />}
            </div>
            
        </div>
    )
}
