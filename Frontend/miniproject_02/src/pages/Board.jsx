import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Board.css";

const Board = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [boardList, setBoardList] = useState([]);
    const [pagination, setPagination] = useState(null);

    const [page, setPage] = useState(() => {
        const params = new URLSearchParams(location.search);
        return Number(params.get("nowpage")) || 1;
    });

    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchType, setSearchType] = useState("title"); // title, writer, content

    //검색
    const fetchBoardList = (keyword = "", type = "title") => {
        const query = new URLSearchParams({
            page,
            recordSize: 10,
            searchType: type,
            keyword: keyword,
        }).toString();

        fetch(`/api/board?${query}`)
            .then((res) => res.json())
            .then((data) => {
                setBoardList(data.list);
                setPagination(data.pagination);
            })
            .catch((err) => console.error("게시글 불러오기 실패:", err));
    };


    // useEffect(() => {
    //     navigate(`?nowpage=${page}`, { replace: true });
    // }, [page, navigate]);
    useEffect(() => {
        fetchBoardList(searchKeyword, searchType);
        navigate(`?nowpage=${page}`, { replace: true });
    }, [page, navigate, searchKeyword, searchType]);


    useEffect(() => {
        fetch(`/api/board?page=${page}&recordSize=10`)
            .then((res) => res.json())
            .then((data) => {
                setBoardList(data.list);
                setPagination(data.pagination);
            })
            .catch((err) => console.error("게시글 불러오기 실패:", err));
    }, [page]);

    const handleSearch = () => {
        setPage(1); // 검색 시 첫 페이지로 이동
        // fetchBoardList(searchKeyword, searchType); 검색 추가하면서 이거 주석처리
    };

    const handleSearchReset = () => {
        setSearchKeyword("");
        setSearchType("title");
        setPage(1);
        //fetchBoardList(); // 전체 목록 다시 불러오기
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };


    const handleGoWrite = () => {
        navigate("/write");
    };

    const handleGoView = async (boardId) => {
        try {
            await fetch(`/api/board/hit/${boardId}`, {
                method: "PUT",
            });
        } catch (err) {
            console.error("조회수 증가 실패:", err);
        }

        navigate(`/view?boardId=${boardId}&nowpage=${page}`);
    };

    return (
        <div className="board-main-layout">
            <div className="board-section">
                <h2 style={{ margin: 0 }} className="board-title">게시판</h2>
                <br />
                <br />
                <div className="board-table-wrapper">
                    <table className="board-table">
                        <thead>
                            <tr>
                                <th className="table-num">No</th>
                                <th className="table-title1">제목</th>
                                <th className="table-name">작성자</th>
                                <th className="table-view">조회수</th>
                                
                            </tr>
                        </thead>
                        <tbody>
                            {boardList.map((board) => (
                                <tr key={board.BOARD_ID}>
                                    <td className="table-num">{board.BOARD_ID}</td>
                                    <td className="table-title">
                                        <a onClick={() => handleGoView(board.BOARD_ID)} style={{ cursor: "pointer" }}>
                                            {board.TITLE}
                                        </a>
                                    </td>
                                    <td className="writer-cell">{board.WRITER}</td>
                                    <td className="table-view">{board.HIT}</td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {pagination && (
                    <div className="pagination">
                        {pagination.existPrevPage && (
                            <button className="pagination-btn" onClick={() => setPage(page - 1)}>이전</button>
                        )}
                        {[...Array(pagination.endPage - pagination.startPage + 1)].map((_, i) => {
                            const pageNum = pagination.startPage + i;
                            return (
                                <button
                                    key={pageNum}
                                    className={`pagination-btn ${page === pageNum ? "active" : ""}`}
                                    onClick={() => setPage(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        {pagination.existNextPage && (
                            <button className="pagination-btn" onClick={() => setPage(page + 1)}>다음</button>
                        )}
                    </div>
                )}
                <div className="board-header">
                    <div className="board-search-box">
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            className="board-search-select"
                        >
                            <option value="title">제목</option>
                            <option value="writer">작성자</option>
                        </select>
                        <input
                            type="text"
                            placeholder="검색어를 입력하세요"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="board-search-input"
                        />
                        <button onClick={handleSearch} className="board-search-btn">
                            검색
                        </button>
                        <button className="btn write-post" onClick={handleGoWrite}>
                            글 작성
                        </button>
                    </div>

                </div>


            </div>
        </div>

    );
};

export default Board;
