import { LikeOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useDidMount } from '~/hooks';
import { likePost } from '~/services/api';

interface IProps {
    postID: string;
    isLiked: boolean;
    likeCallback: (postID: string, state: boolean, newLikeCount: number) => void;
}

const LikeButton: React.FC<IProps> = (props) => {
    const [isLiked, setIsLiked] = useState(props.isLiked);
    const [isLoading, setLoading] = useState(false);
    const [showReact, setShowReact]= useState(false)
    const didMount = useDidMount();

    useEffect(() => {
        setIsLiked(props.isLiked);
    }, [props.isLiked]);

    const dispatchLike = async () => {
        if (isLoading) return;

        try {
            setLoading(true);

            const { state, likesCount } = await likePost(props.postID);
            if (didMount) {
                setLoading(false);
                setIsLiked(state);
            }

            props.likeCallback(props.postID, state, likesCount);
        } catch (e) {
            didMount && setLoading(false);
            console.log(e);
        }
    }

    return (
        <span
            style={{position: "relative"}}
            onMouseEnter={()=> {
                setTimeout(()=> {
                    setShowReact(true)
                }, 500)
            }}
            onMouseLeave={()=> {
                setTimeout(()=> {
                    setShowReact(false)
                }, 500)
            }}
            className={`px-1 py-2 rounded-md flex items-center justify-center hover:bg-gray-100 cursor-pointer text-l w-2/4  ${isLiked ? 'text-indigo-700 font-bold dark:text-indigo-400 dark:hover:bg-indigo-1100' : 'text-gray-700 dark:hover:bg-indigo-1100 dark:hover:text-white  dark:bg-indigo-1000 hover:text-gray-800 dark:text-gray-400'} ${isLoading && 'opacity-50'}`}
            onClick={dispatchLike}
        >
            {
                !isLiked && showReact=== true && <figure style={{display: "flex", width: 300, position: "absolute", top: "-100%", left: 0, border: "1px solid #e7e7e7"}}>
                <img onClick={()=> setShowReact(false)} src="https://www.dropbox.com/s/rgfnea7od54xj4m/like.gif?raw=1"  alt="Like emoji" />
                <img onClick={()=> setShowReact(false)} src="https://www.dropbox.com/s/sykc43x39wqxlkz/love.gif?raw=1"  alt="Love emoji" />
                <img onClick={()=> setShowReact(false)} src="https://www.dropbox.com/s/vdg0a8i0kyd16zk/haha.gif?raw=1"  alt="Haha emoji" />
                <img onClick={()=> setShowReact(false)} src="https://www.dropbox.com/s/ydl0fm5kayxz0e5/wow.gif?raw=1"   alt="Wow emoji" />
                <img onClick={()=> setShowReact(false)} src="https://www.dropbox.com/s/52n5woibt3vrs76/sad.gif?raw=1"   alt="Sad emoji" />
                <img onClick={()=> setShowReact(false)} src="https://www.dropbox.com/s/kail2xnglbutusv/angry.gif?raw=1" alt="Angry emoji" />
            </figure>
            }

            <LikeOutlined />
            &nbsp;
            {isLiked ? 'Unlike' : 'Like'}
        </span>
    );
};

export default LikeButton;
