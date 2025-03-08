import "../../src/CSS/dashboard.css";
import Table from "../components/Table";
import Button from '../components/Button';

const Dashboard = () => {

  //dummy data
  const columns = [
    { label: "ID", key: "id" },
    { label: "Title", key: "title" },
    { label: "Borrower Name", key: "borrowerName" },
    { label: "Type", key: "type" },
    { label: "Date", key: "date" },
  ];
  
  const data = [
    {
      id: "B001",
      title: "The Great Gatsby",
      borrowerName: "John Doe",
      type: "Book",
      date: "12/02/2024",
    },
    {
      id: "B002",
      title: "Introduction to Machine Learning",
      borrowerName: "Alice Smith",
      type: "Book",
      date: "25/01/2024",
    },
    {
      id: "B003",
      title: "Avengers: Endgame",
      borrowerName: "Michael Johnson",
      type: "DVD",
      date: "05/03/2024",
    },
  ];

  const columns2 = [
    { label: "ID", key: "id" },
    { label: "Code", key: "code" },
    { label: "Title", key: "title" },
    { label: "Type", key: "type" },
    { label: "Number of Borrows", key: "numBorrows" },
  ];
  
  const data2 = [
    {
      id: "1",
      code: "BK-1001",
      title: "The Great Gatsby",
      type: "Book",
      numBorrows: 15,
    },
    {
      id: "2",
      code: "BK-1002",
      title: "Introduction to Machine Learning",
      type: "Book",
      numBorrows: 8,
    },
    {
      id: "3",
      code: "DVD-2001",
      title: "Avengers: Endgame",
      type: "DVD",
      numBorrows: 12,
    },
  ];
  
  return (
    <div className="dashboard-page">
      <div className="stat-cards-container">
          <div className="stat-card"></div>
          <div className="stat-card"></div>
          <div className="stat-card"></div>
          <div className="stat-card"></div>
          <div className="stat-card"></div>
      </div>

      <div className="recent-transactions-container">
        <div className="container-title">
          <h2>Recent Transactions</h2>
        </div>
          <Table columns={columns} data={data} showActions={true} />
          <div className="bottom-buttons">
            <Button onClick = {() => {}} label={"Add Transaction"} lightBackgrnd={false}></Button>
          </div>
      </div>

      <div className="recent-transactions-container">
        <div className="container-title">
            <h2>Most Borrowed Books</h2>
          </div>
          <Table columns={columns2} data={data2} showActions={false} />
      </div>
    </div>
  );
};

export default Dashboard;