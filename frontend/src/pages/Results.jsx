import { axiosGetAllResults } from "../api/axios";
import { useSignals, useSignalEffect } from "@preact/signals-react/runtime";
import { signal } from "@preact/signals-react";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";

const data = signal();
const loading = signal(true);
const empty = signal(true);

export default function Results() {
  useSignals();
  useSignalEffect(() => {
    axiosGetAllResults
      .get()
      .then((response) => {
        if (response.status === 200) {
          if (response.data.length > 0) {
            data.value = response.data;
            empty.value = false;
          }
        }
        loading.value = false;
      })
      .catch((error) => {
        console.log("error in Results useSignalEffect", error);
        loading.value = false;
      });
  });

  const navigate = useNavigate();

  function handleResultsButton(id) {
    navigate(`/result/${id}`);
  }

  function handlePenTestButton() {
    navigate("/");
  }

  function getURL(result) {
    let parsedData = JSON.parse(result);
    const index = parsedData.findIndex(item=> item.test === "connection_and_records" );
    return JSON.stringify(parsedData[index].report.url).replace(
      /"/g,
      ""
    );
  }

  function getScorePTT(result) {
    let parsedData = JSON.parse(result);
    const index = parsedData.findIndex(item=> item.test === "PTT" );

    const isThereScore = parsedData[index]?.score.security_score === undefined;
    if (!isThereScore) {
      return JSON.stringify(parsedData[index]?.score.security_score)+"/10";
    }

    return "N/A";
  }

  function getScoreZAP(result) {
    let parsedData = JSON.parse(result);
    const index = parsedData.findIndex(item=> item.test === "ZAP" );

    const isThereScore = parsedData[index]?.score.security_score === undefined;
    if (!isThereScore) {
      return JSON.stringify(parsedData[index]?.score.security_score)+"/10";
    }

    return "N/A";
  }

  return (
    <>
      {loading.value ? (
        <>
          <Loading />
        </>
      ) : (
        <>
          {empty.value ? (
            <>
              <div className="mt-6 text-xl text-warning">
                No previous pen test results!
                <button
                  className="btn btn-primary ml-4"
                  onClick={handlePenTestButton}
                >
                  Start A Pen Test
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto container mt-6">
                <div className="overflow-x-auto">
                  <table className="table">
                    {/* head */}
                    <thead>
                      <tr>
                        <th>Pen Test ID</th>
                        <th>URL</th>
                        <th>Base Test Score</th>
                        <th>ZAP Test Score</th>
                        <th>Created At</th>
                        <th>Go To Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.value.map((item) => (
                        <tr key={item.id}>
                          <th>{item.id}</th>
                          <td>{getURL(item.result)}</td>
                          <td>{getScorePTT(item.result)}</td>
                          <td>{getScoreZAP(item.result)}</td>
                          <td>{item.created_at}</td>
                          <td>
                            <button
                              className="btn btn-primary"
                              onClick={() => handleResultsButton(item.id)}
                            >
                              Go to result
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
