import "../../src/CSS/dashboard.css";
import Table from "../components/Table";
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import Cookies from 'js-cookie';

const Dashboard = () => {
  const token = Cookies.get('jwt_token');

  if (token) {
    console.log('JWT Token from Cookie:', token);
  } else {
    console.log('No token found in cookies');
  }
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
          <StatCard title={"Readers"} number={10} subtitle={"Total Number of Readers"} image={"../../public/assets/images/Group.png"}></StatCard>
          <StatCard title={"Books Available"} number={10} subtitle={"Total Number of Books Available"} image={"../../public/assets/images/Group.png"}></StatCard>
          <StatCard title={"Books Borrowed"} number={10} subtitle={"Number of Books Currently Borrowed"} image={"../../public/assets/images/Group.png"}></StatCard>
          <StatCard title={"Monthly Borrows"} number={10} subtitle={"Total Number of Borrows This Month"} image={"../../public/assets/images/Group.png"}></StatCard>
          <StatCard title={"Overdue Books"} number={10} subtitle={"Total Number of Overdue Books"} image={"../../public/assets/images/Group.png"}></StatCard>
      </div>

      <div className="recent-transactions-container">
          <Table columns={columns} data={data} showActions={true} title={"Recent Transactions"} />
          <div className="bottom-buttons">
            <Button onClick = {() => {}} label={"Add Transaction"} lightBackgrnd={false}></Button>
          </div>
      </div>

      <div className="recent-transactions-container">
          <Table columns={columns2} data={data2} showActions={false} title={"Most Borrowed Books"} />
      </div>
    </div>
  );
};

export default Dashboard;