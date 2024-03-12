import CaseResultSvg from "./CaseResultSvg";
import SchemaDisplay from "./SchemaDisplay";
import {
  SetStateAction,
  useEffect,
  useState,
  useTransition,
  useRef,
  RefObject,
  useContext,
  ReactNode,
  useMemo,
} from "react";
import { Accordion } from "react-bootstrap";
import { mapLanguage } from "../../data/mapLanguage";
import {
  Case,
  CaseResult,
  Implementation,
  ImplementationResults,
} from "../../data/parseReportData";
import { ThemeContext } from "../../context/ThemeContext";

interface CaseProps {
  seq: number;
  caseData: Case;
  schemaDisplayRef?: RefObject<HTMLDivElement>;
  searchText: string;
  implementations: Implementation[];
  implementationsResults: ImplementationResults[];
}

const CaseContent = ({
  seq,
  schemaDisplayRef,
  caseData,
  implementations,
  implementationsResults,
}: CaseProps) => {
  const [instance, setInstance] = useState<SetStateAction<unknown>>(
    caseData.tests[0].instance,
  );
  const [activeRow, setActiveRow] = useState<SetStateAction<unknown>>(0);

  return (
    <>
      <SchemaDisplay schema={caseData.schema} instance={instance} />
      <div className="overflow-x-auto">
        <table className="table table-hover">
          <thead>
            <tr>
              <td scope="col">
                <b>Tests</b>
              </td>
              {implementations.map((implementation) => (
                <td
                  className="text-center"
                  scope="col"
                  key={implementation.name + implementation.language}
                >
                  <div className="flex-column d-flex">
                    <b>{implementation.name}</b>
                    <small className="text-muted">
                      {mapLanguage(implementation.language)}
                    </small>
                  </div>
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {caseData.tests.map((test, index) => (
              <tr
                className={activeRow === index ? "table-active" : ""}
                key={index}
                onClick={() => {
                  setInstance(test.instance);
                  setActiveRow(index);
                  if (schemaDisplayRef) {
                    schemaDisplayRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
              >
                <td>
                  <p className="m-0">{test.description}</p>
                </td>
                {implementationsResults.map((implResult, i) => {
                  const caseResults = implResult.cases.get(seq);
                  const result: CaseResult =
                    caseResults !== undefined
                      ? caseResults[index]
                      : { state: "errored" };
                  return <CaseResultSvg key={i} result={result} />;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const CaseItem = ({
  seq,
  caseData,
  implementations,
  searchText,
  implementationsResults,
}: CaseProps) => {
  const [content, setContent] = useState(<></>);
  const [, startTransition] = useTransition();
  const schemaDisplayRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useContext(ThemeContext);

  const highlightDescription = useMemo(() => {
    const HighlightedDescription = (
      description: string,
      searchText: string,
    ): ReactNode => {
      if (!searchText) {
        return description;
      }

      const regex = new RegExp(`(${searchText})`, "gi");
      const parts: string[] = description.split(regex);
      return (
        <>
          {parts.map((part, index) =>
            regex.test(part) ? (
              <mark
                key={index}
                className={`bg-primary p-0 ${
                  isDarkMode ? "text-dark" : "text-light"
                }`}
              >
                {part}
              </mark>
            ) : (
              <span key={index}>{part}</span>
            ),
          )}
        </>
      );
    };

    HighlightedDescription.displayName = "HighlightedDescription";

    return HighlightedDescription;
  }, [isDarkMode]);

  useEffect(() => {
    startTransition(() =>
      setContent(
        <CaseContent
          seq={seq}
          caseData={caseData}
          implementations={implementations}
          implementationsResults={implementationsResults}
          schemaDisplayRef={schemaDisplayRef}
          searchText={searchText}
        />,
      ),
    );
  }, [seq, caseData, implementations, implementationsResults, searchText]);
  return (
    <Accordion.Item ref={schemaDisplayRef} eventKey={seq.toString()}>
      <Accordion.Header>
        {highlightDescription(caseData.description, searchText)}
      </Accordion.Header>
      <Accordion.Body>{content}</Accordion.Body>
    </Accordion.Item>
  );
};

export default CaseItem;