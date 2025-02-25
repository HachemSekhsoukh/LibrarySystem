//  fetching data
  export const updateProposalState = async (proposal_id, is_accepted) => {

    try {
      const submission = {
        "id": proposal_id,
        "state": is_accepted  
      };

      const res = await fetch(
        "https://anae-hackathon.vercel.app/update_proposal",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          body: JSON.stringify(submission)
        }
      );
      if (!res.ok) {
        alert("couldnt get data");
        return {"error": "updating proposal failed"}
      }
      const data = await res.json();
      console.log(data);
      

    } catch (error) {
      console.log(error);
    }
  };