import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery
} from '@tanstack/react-query';

import {SearchPosts, createPost, createUserAccount, deletePost, deleteSavePost, getAllPostByIds, getCurrentUser, getInfinitePosts, getPostById, getRecentPosts, getUser, getUserById, likePost, savePost, signInAccount, signOutAccount, updatePost, updateUser} from '../appwrite/api'
import { INewPost, INewUser, IUpdatePost, IUpdateUser } from '../../../types';
import { QUERY_KEYS } from './queryKeys';

export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user)
    })
}

export const useSignInAccount = () => {
    return useMutation({
        mutationFn: (user: {email: string, password: string}) => signInAccount(user)
    })
}

export const useSignOutAccount = () => {
    return useMutation({
        mutationFn: signOutAccount
    })
}

export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (post: INewPost) => createPost(post),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        });
      },
    });
  };


export const useUpdatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (post: IUpdatePost) => updatePost(post),
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
        });
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
          });
      },
    });
  };

  export const useDeletePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({postId, imageId} : {postId: string, imageId: string}) => deletePost(postId, imageId),
      onSuccess: () => {
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
          });
      },
    });
  };


  //  GET RECENT POST
export const useGetRecentPosts = () =>
{
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        queryFn: getRecentPosts
    })
}

export const useLikePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({postId, likesArray}: {postId: string, likesArray: string[]}) => likePost(postId, likesArray),
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: [QUERY_KEYS.GET_RECENT_POSTS]})
            queryClient.invalidateQueries({queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]})
            queryClient.invalidateQueries({queryKey: [QUERY_KEYS.GET_POSTS]})
            queryClient.invalidateQueries({queryKey: [QUERY_KEYS.GET_CURRENT_USER]})
        }
    })
}

export const useSavePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({postId, userId}: {postId: string, userId: string}) => savePost(postId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: [QUERY_KEYS.GET_RECENT_POSTS]})
            queryClient.invalidateQueries({queryKey: [QUERY_KEYS.GET_POSTS]})
            queryClient.invalidateQueries({queryKey: [QUERY_KEYS.GET_CURRENT_USER]})
        }
    })
}

export const useDeleteSavePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (saveId: string) => deleteSavePost(saveId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: [QUERY_KEYS.GET_RECENT_POSTS]})
            queryClient.invalidateQueries({queryKey: [QUERY_KEYS.GET_POSTS]})
            queryClient.invalidateQueries({queryKey: [QUERY_KEYS.GET_CURRENT_USER]})
        }
    })
}


// ============================================================
// USER QUERIES
// ============================================================

export const useGetCurrentUser = () => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      queryFn: getCurrentUser,
    });
  };


export const useGetPostById = (postId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
        queryFn: () => getPostById(postId),
        enabled: !!postId
    })
}

export const useGetAllPostByIds = (postId: string[]) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
        queryFn: () => getAllPostByIds(postId),
        enabled: !!postId
    })
}

export const useGetPosts = () => {
    return useInfiniteQuery({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
        queryFn: getInfinitePosts,
        getNextPageParam: (lastPage) => {
          // If there's no data, there are no more pages.
          if (lastPage && lastPage.documents.length === 0) {
            return null;
          }
    
          // Use the $id of the last document as the cursor.
          const lastId = lastPage?.documents[lastPage.documents.length - 1].$id;
          return lastId
        },
      });
}

export const useSearchPosts = (searchTerm: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
        queryFn: () => SearchPosts(searchTerm),
        enabled: !!searchTerm
    })
}

export const useGetUsers = (limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: () => getUser(limit)
  })
}

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: IUpdateUser) => updateUser(user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
      });
    },
  });
};