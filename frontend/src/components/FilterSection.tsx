import "./FilterSection.css";
import { Badge, Card, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSearchParams } from "../hooks/useSearchParams.ts";
import { X } from "react-bootstrap-icons";
import { mapLanguage } from "../data/mapLanguage.ts";
import { useState } from "react";

export const FilterSection = ({
  languages,
  vocabularies,
}: {
  languages: string[];
  vocabularies: string[];
}) => {
  const params = useSearchParams();

  return (
    <Card className="mx-auto mb-3 w-75">
      <Card.Header>Filtering</Card.Header>
      <Card.Body>
        <Card.Title>Language</Card.Title>
        <div className="d-flex align-items-center">
          <div className="d-flex" style={{ width: "50%" }}>
            <div className="d-flex flex-wrap gap-2 py-2">
              {languages.map((lang) => (
                <FilterChip key={lang} current={lang} searchParams={params} />
              ))}
            </div>
          </div>
          <div className="m-4" style={{ width: "20%" }}>
            <VocabDropDown vocabularies={vocabularies} searchParams={params} />
          </div>
          <div className="m-4" style={{ width: "20%" }}>
            Keyword
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

const FilterChip = ({
  current,
  searchParams,
}: {
  current: string;
  searchParams: URLSearchParams;
}) => {
  const languages = searchParams.getAll("language");
  if (languages.includes(current)) {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("language");
    languages
      .filter((lang) => lang !== current)
      .forEach((lang) => newParams.append("language", lang));
    return (
      <Link key={current} to={{ search: newParams.toString() }}>
        <Badge pill bg="filter-active">
          <div className="px-2">{mapLanguage(current)}</div>
          <X size="20px" className="mr-1" />
        </Badge>
      </Link>
    );
  } else {
    const newParams = new URLSearchParams(searchParams);
    newParams.append("language", current);
    return (
      <Link key={current} to={{ search: newParams.toString() }}>
        <Badge
          pill
          bg="filter"
          style={{ width: "80px" }}
          className="justify-content-center"
        >
          <div className="text-center">{mapLanguage(current)}</div>
        </Badge>
      </Link>
    );
  }
};

const VocabDropDown = ({
  vocabularies,
  searchParams,
}: {
  vocabularies: string[];
  searchParams: URLSearchParams;
}) => {
  const [selectedVocabulary, setSelectedVocabulary] = useState<string | null>(
    null,
  );

  const handleSelect = (vocabulary: string) => {
    const newParams = new URLSearchParams(searchParams);

    if (selectedVocabulary === vocabulary) {
      setSelectedVocabulary(null);
      newParams.delete("vocabulary");
    } else {
      setSelectedVocabulary(vocabulary);

      newParams.set("vocabulary", vocabulary);
    }
  };

  return (
    <Dropdown onSelect={handleSelect}>
      <Dropdown.Toggle variant="primary">
        {"Select a Vocabulary"}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {vocabularies.map((vocabulary) => (
          <Dropdown.Item key={vocabulary} eventKey={vocabulary}>
            <Link to={{ search: `?vocabulary=${vocabulary}` }}>
              {vocabulary}
            </Link>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
