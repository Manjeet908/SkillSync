import React,{useState,useEffect, use} from 'react'
import './Searchbar.css'
import axiosInstance from '../../api/axios';
function Searchbar() {
    const [searchedUsers, setSearchedUsers] = useState([]);
    const [searchedPosts, setSearchedPosts] = useState([]);
    const [query,setQuery] = useState('');
    useEffect(() => {
        const fetchSuggestions = async () => {
            if(query.trim()==="")
            {
                setSearchedUsers([]);
                setSearchedPosts([]);
                return;
            }
            try{
                const res = await axiosInstance.get(`/search/users?q=${query}`);
                setSearchedUsers(res.data.data);
            }
            catch(err){
                console.error("Error fetching searched users:", err);
            }
            try{
                const res = await axiosInstance.get(`/search/posts?q=${query}`);
                setSearchedPosts(res.data.data);
            }
            catch(err){
                console.error("Error fetching searched posts:", err);
            }
        };
        const debounce = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounce);
    }
    , [query]);
  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {searchedUsers.length > 0 && (
        <ul className="suggestions-list">
          {searchedUsers.map((item) => (
            <li key={item._id} className="suggestion-item">
              {item.username}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Searchbar