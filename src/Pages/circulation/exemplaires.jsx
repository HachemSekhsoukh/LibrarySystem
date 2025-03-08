import Table from "../../components/Table";
import Button from '../../components/Button';

const Exemplaires = () => {
  const columns = [
    { label: "ID", key: "id" },
    { label: "Title", key: "title" },
    { label: "Borrower Name", key: "borrower_name" },
    { label: "Type", key: "type" },
    { label: "Date", key: "date" },
  ];
  const data = [
    {
      id: 1,
      title: "JavaScript Basics",
      borrower_name: "Alice Johnson",
      type: "Book",
      date: "2024-03-08",
    },
    {
      id: 2,
      title: "Advanced React",
      borrower_name: "Bob Smith",
      type: "E-book",
      date: "2024-03-07",
    },
    {
      id: 3,
      title: "Node.js Mastery",
      borrower_name: "Charlie Brown",
      type: "Book",
      date: "2024-03-06",
    },
  ];
  return (
    <>
    <div className="container">
      <div className="container-title">
          <h2>Recent Transactions</h2>
        </div>
    <div id='table'>
    <Table columns={columns} data={data} showActions={true} />
    </div>
    <div className="bottom-buttons">
            <Button onClick = {() => {}} label={"Add Transaction"} lightBackgrnd={false}></Button>
          </div>
    </div>
    </>
  );
};

export default Exemplaires;