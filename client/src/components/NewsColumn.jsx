import { useState, useEffect } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

const SMART_TAGS = [
  { keyword: "cricket", label: "Cricket", className: "tag-cricket" },
  { keyword: "politics", label: "Politics", className: "tag-politics" },
  { keyword: "tech", label: "Tech", className: "tag-tech" },
  { keyword: "economy", label: "Economy", className: "tag-economy" },
  { keyword: "market", label: "Market", className: "tag-market" },
  { keyword: "world", label: "World", className: "tag-world" },
];

const getSmartTags = (title = "") => {
  const lowerTitle = title.toLowerCase();
  return SMART_TAGS.filter((tag) => lowerTitle.includes(tag.keyword));
};

const NewsColumn = ({ sourceId, title }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readArticles, setReadArticles] = useState(() => {
    const saved = localStorage.getItem(`read_${sourceId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      // const apiUrl = (`${import.meta.env.VITE_API_URL}/news` );
      // const response = await axios.get(`${apiUrl}/api/news?source=${sourceId}`);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/news?source=${sourceId}`,
      );

      setArticles(response.data);
    } catch (err) {
      setError("Failed to load news");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [sourceId]);

  const handleArticleClick = (link) => {
    if (!readArticles.includes(link)) {
      const newRead = [...readArticles, link];
      setReadArticles(newRead);
      localStorage.setItem(`read_${sourceId}`, JSON.stringify(newRead));
    }
    window.open(link, "_blank");
  };

  return (
    <div className="news-column">
      <div className={`column-header header-${sourceId}`}>
        <span>{title}</span>
        <button onClick={fetchNews} className="refresh-btn" title="Refresh">
          ↻
        </button>
      </div>

      <div className="articles-list">
        {loading && (
          <p style={{ textAlign: "center", padding: "20px" }}>Loading...</p>
        )}
        {error && (
          <p style={{ textAlign: "center", color: "red", padding: "20px" }}>
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          articles.map((article, index) => {
            const tags = getSmartTags(article.title);
            const isRead = readArticles.includes(article.link);

            return (
              <div
                key={index}
                className={`article-card ${isRead ? "read" : ""}`}
                onClick={() => handleArticleClick(article.link)}
              >
                <h3 className="article-title">{article.title}</h3>
                <div className="article-meta">
                  <span>
                    {" "}
                    {article.pubDate
                      ? formatDistanceToNow(new Date(article.pubDate), {
                          addSuffix: true,
                        })
                      : "Just now"}
                  </span>
                </div>

                {tags.length > 0 && (
                  <div className="tags">
                    {tags.map((tag) => (
                      <span key={tag.label} className={`tag ${tag.className}`}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default NewsColumn;
