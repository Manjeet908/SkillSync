import './Searchbar.css'
import {useState,useEffect} from 'react'
import axiosInstance from '../../api/axios';
import { useNavigate } from 'react-router-dom';

function Searchbar() {
    const [searchedUsers, setSearchedUsers] = useState([]);
    const [searchedPosts, setSearchedPosts] = useState([]);
    const [query,setQuery] = useState('');
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchSuggestions = async () => {
            if(query.trim()==="") {
                setSearchedUsers([]);
                setSearchedPosts([]);
                return;
            }
            try{
                const res = await axiosInstance.get(`/search/users?q=${query}`);
                setSearchedUsers(res.data.data.slice(0, 3));
            }
            catch(err){
                console.error("Error fetching searched users:", err);
            }
            try{
                const res = await axiosInstance.get(`/search/posts?q=${query}`);
                setSearchedPosts(res.data.data.slice(0, 3));
            }
            catch(err){
                console.error("Error fetching searched posts:", err);
            }
        };
        const debounce = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    const handleUserClick = (username) => {
        navigate(`/profile/${username}`);
        setQuery('');
    };

    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`);
        setQuery('');
    };

    return (
        <div className="search-container">
            <input
                type="text"
                className="search-input"
                placeholder="Search users and posts..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {(searchedUsers.length > 0 || searchedPosts.length > 0) && (
                <div className="search-results">
                    {searchedUsers.length > 0 && (
                        <div className="search-section">
                            <h3 className="section-title">People</h3>
                            <ul className="suggestions-list">
                                {searchedUsers.map((user) => (
                                    <li 
                                        key={user._id} 
                                        className="suggestion-item user-item"
                                        onClick={() => handleUserClick(user.username)}
                                    >
                                        <img 
                                            src={user.avatar} 
                                            alt={user.username}
                                            className="user-avatar"
                                        />
                                        <div className="user-info">
                                            <span className="user-fullname">{user.fullName}</span>
                                            <span className="user-username">@{user.username}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {searchedPosts.length > 0 && (
                        <div className="search-section">
                            <h3 className="section-title">Posts</h3>
                            <ul className="suggestions-list">
                                {searchedPosts.map((post) => (
                                    <li 
                                        key={post._id} 
                                        className="suggestion-item post-item"
                                        onClick={() => handlePostClick(post._id)}
                                    >
                                        {post.media && post.media.length > 0 && (
                                            <img 
                                                src={post.media[0].includes('video') 
                                                    ? post.media[0].replace('/upload/', '/upload/so_5/').replace(/\.[^/.]+$/, '.jpg')
                                                    : post.media[0]} 
                                                alt="Post thumbnail"
                                                className="post-thumbnail"
                                            />
                                        )}
                                        <div className="post-content">
                                            <div className="post-creator">
                                                <img 
                                                    src={post.creator?.avatar} 
                                                    alt={post.creator?.username}
                                                    className="creator-avatar"
                                                />
                                                <span className="creator-username">@{post.creator?.username}</span>
                                            </div>
                                            <h4 className="post-title">{post.title}</h4>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Searchbar
