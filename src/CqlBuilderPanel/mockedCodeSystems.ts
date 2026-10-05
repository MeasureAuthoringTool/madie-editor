import { CodeSystem } from "../api/useTerminologyServiceApi";

export const mockedCodeSystems = [
  {
    id: "1",
    name: "System1",
    title: "System 1",
    version: {
      vsacVersion: "HL7V3.0_2019-12",
      fhirVersion: "1.0",
    },
    lastUpdatedUpstream: new Date(1999, 10, 1).toString(),
    lastUpdated: new Date(1999, 10, 1).toString(),
  },
  {
    id: "2",
    name: "System1",
    title: "System 1",
    version: {
      vsacVersion: "HL7V3.0_2019-02",
      fhirVersion: "2.0",
    },
    lastUpdatedUpstream: new Date(2000, 10, 1).toString(),
    lastUpdated: new Date(1999, 10, 1).toString(),
  },
  {
    fullUrl: "http://terminology.hl7.org/CodeSystem/v3-AdministrativeGender",
    id: "AdministrativeGender2016-07-01",
    lastUpdated: "2024-12-27T20:11:49.613Z",
    lastUpdatedUpstream: "2017-02-02T05:00:00.000+00:00",
    name: "AdministrativeGender",
    oid: "urn:oid:2.16.840.1.113883.5.1",
    title: "AdministrativeGender",
    version: {
      fhirVersion: "2016-07-01",
      vsacVersion: "HL7V3.0_2016-07",
    },
    versionId: "2617317427",
  },
  {
    fullUrl: "http://terminology.hl7.org/CodeSystem/v3-AdministrativeGender",
    id: "AdministrativeGender2015-07-01",
    lastUpdated: "2024-12-27T20:11:49.613Z",
    lastUpdatedUpstream: "2016-06-20T04:00:00.000+00:00",
    name: "AdministrativeGender",
    oid: "urn:oid:2.16.840.1.113883.5.1",
    title: "AdministrativeGender",
    version: {
      fhirVersion: "2015-07-01",
      vsacVersion: "HL7V3.0_2015-07",
    },
    versionId: "2903671356",
  },
  {
    fullUrl: "http://snomed.info/sct",
    id: "SNOMED-CT US Editionhttp://snomed.info/sct/731000124108/version/20180901",
    lastUpdated: "2024-12-27T20:12:05.262Z",
    lastUpdatedUpstream: "2018-09-17T04:00:00.000+00:00",
    name: "SNOMEDCT",
    oid: "urn:oid:2.16.840.1.113883.6.96",
    title: "SNOMED-CT US Edition",
    version: {
      fhirVersion: "http://snomed.info/sct/731000124108/version/20180901",
      vsacVersion: "2018-09",
    },
    versionId: "669066113",
  },
  {
    fullUrl: "http://snomed.info/sct",
    id: "SNOMED-CT US Editionhttp://snomed.info/sct/731000124108/version/20130901",
    lastUpdated: "2024-12-27T20:12:05.262Z",
    lastUpdatedUpstream: "2013-10-29T04:00:00.000+00:00",
    name: "SNOMEDCT",
    oid: "urn:oid:2.16.840.1.113883.6.96",
    title: "SNOMED-CT US Edition",
    version: {
      fhirVersion: "http://snomed.info/sct/731000124108/version/20130901",
      vsacVersion: "2013-09",
    },
    versionId: "3764777214",
  },
] as Array<CodeSystem>;
