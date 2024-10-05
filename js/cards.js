const { useEffect, useState } = React;

const PAGE_SIZE = 10; // Set the number of cards per page

const DataLoader = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTag, setSelectedTag] = useState(''); // State for selected tag

    // Get JSON paths from the data attribute
    const jsonPaths = JSON.parse(document.getElementById('data-file').getAttribute('data-json-paths'));

    // Fetch data from a given JSON path
    const fetchData = async (path) => {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Error fetching ${path}: ${response.statusText}`);
        }
        return await response.json();
    };

    // Load data and update the state
    const loadData = async () => {
        try {
            setLoading(true);
            const allData = await Promise.all(jsonPaths.map(fetchData));
            const combinedData = Object.assign({}, ...allData);
            
            // Sort data by title
            const sortedData = Object.values(combinedData).sort((a, b) => a.title.localeCompare(b.title));
            setData(sortedData);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Read current page from URL on mount
        const urlParams = new URLSearchParams(window.location.search);
        const page = parseInt(urlParams.get('page'), 10) || 1;
        setCurrentPage(page);
        
        loadData();
    }, []);

    useEffect(() => {
        // Update URL when current page changes
        window.history.pushState({}, '', `?page=${currentPage}`);
    }, [currentPage]);

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const totalPages = Math.ceil(data.length / PAGE_SIZE);
    const currentData = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Get unique tags for filtering
    const tags = Array.from(new Set(data.flatMap(card => card.tags))).sort();

    // Filter cards based on selected tag
    const filteredData = selectedTag ? data.filter(card => card.tags.includes(selectedTag)) : data;
    const displayedData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const filteredTotalPages = Math.ceil(filteredData.length / PAGE_SIZE);

    const handleTagSelect = (tag) => {
        setSelectedTag(tag);
        setCurrentPage(1); // Reset to first page on tag change
    };

    return (
        <div>
            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div>
                    <div id="tags-container">
                        {/* Display all tags alphabetically */}
                        <div>
                            {tags.map(tag => (
                                <button id="tag" key={tag} onClick={() => handleTagSelect(tag)} className={selectedTag === tag ? 'selected' : ''}>
                                    {tag.toUpperCase()}
                                </button>
                            ))}
                            <button id="tag" onClick={() => handleTagSelect('')}>Show All</button>
                        </div>
                    </div>
                    <div id="card-container">
                        {/* Display current page cards */}
                        {displayedData.map((card, index) => (
                            <div key={index} class="card">
                                <img src={card.image} alt={card.title} /> 
                                <a href={card.url} target="_blank" class="card-title-link">{card.title}</a>
                                <p>{card.description}</p>
                                <div className="tags">
                                    {card.tags.map((tag, idx) => (
                                        <button key={idx} id="tag" onClick={() => handleTagSelect(tag)} className={selectedTag === tag ? 'selected' : ''}>{tag}</button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div class="pagination">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                        <span>Page {currentPage} of {filteredTotalPages}</span>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === filteredTotalPages}>Next</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Render the DataLoader component into the root div
ReactDOM.render(<DataLoader />, document.getElementById('root'));
