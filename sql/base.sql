--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.5
-- Dumped by pg_dump version 9.6.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: FireDepartments; Type: TABLE; Schema: public; Owner: statengine
--

CREATE TABLE "FireDepartments" (
    _id integer NOT NULL,
    fd_id character varying(255),
    name character varying(255),
    state character varying(255),
    firecares_id character varying(255),
    timezone character varying(255),
    integration_verified boolean DEFAULT false,
);


ALTER TABLE "FireDepartments" OWNER TO statengine;

--
-- Name: FireDepartments__id_seq; Type: SEQUENCE; Schema: public; Owner: statengine
--

CREATE SEQUENCE "FireDepartments__id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "FireDepartments__id_seq" OWNER TO statengine;

--
-- Name: FireDepartments__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: statengine
--

ALTER SEQUENCE "FireDepartments__id_seq" OWNED BY "FireDepartments"._id;


--
-- Name: Sessions; Type: TABLE; Schema: public; Owner: statengine
--

CREATE TABLE "Sessions" (
    id integer NOT NULL,
    sid character varying(255) NOT NULL,
    data text
);


ALTER TABLE "Sessions" OWNER TO statengine;

--
-- Name: Sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: statengine
--

CREATE SEQUENCE "Sessions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Sessions_id_seq" OWNER TO statengine;

--
-- Name: Sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: statengine
--

ALTER SEQUENCE "Sessions_id_seq" OWNED BY "Sessions".id;


--
-- Name: Users; Type: TABLE; Schema: public; Owner: statengine
--

CREATE TABLE "Users" (
    _id integer NOT NULL,
    username character varying(255) NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    email character varying(255),
    nfors boolean DEFAULT false,
    role character varying(255) DEFAULT 'user'::character varying,
    password character varying(255),
    provider character varying(255),
    salt character varying(255),
    google json,
    github json,
    fire_department__id integer
);


ALTER TABLE "Users" OWNER TO statengine;

--
-- Name: Users__id_seq; Type: SEQUENCE; Schema: public; Owner: statengine
--

CREATE SEQUENCE "Users__id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Users__id_seq" OWNER TO statengine;

--
-- Name: Users__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: statengine
--

ALTER SEQUENCE "Users__id_seq" OWNED BY "Users"._id;


--
-- Name: FireDepartments _id; Type: DEFAULT; Schema: public; Owner: statengine
--

ALTER TABLE ONLY "FireDepartments" ALTER COLUMN _id SET DEFAULT nextval('"FireDepartments__id_seq"'::regclass);


--
-- Name: Sessions id; Type: DEFAULT; Schema: public; Owner: statengine
--

ALTER TABLE ONLY "Sessions" ALTER COLUMN id SET DEFAULT nextval('"Sessions_id_seq"'::regclass);


--
-- Name: Users _id; Type: DEFAULT; Schema: public; Owner: statengine
--

ALTER TABLE ONLY "Users" ALTER COLUMN _id SET DEFAULT nextval('"Users__id_seq"'::regclass);


--
-- Name: FireDepartments__id_seq; Type: SEQUENCE SET; Schema: public; Owner: statengine
--

SELECT pg_catalog.setval('"FireDepartments__id_seq"', 249, true);


--
-- Name: Sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: statengine
--

SELECT pg_catalog.setval('"Sessions_id_seq"', 70, true);


--
-- Name: Users__id_seq; Type: SEQUENCE SET; Schema: public; Owner: statengine
--

SELECT pg_catalog.setval('"Users__id_seq"', 48, true);


--
-- Name: FireDepartments FireDepartments_pkey; Type: CONSTRAINT; Schema: public; Owner: statengine
--

ALTER TABLE ONLY "FireDepartments"
    ADD CONSTRAINT "FireDepartments_pkey" PRIMARY KEY (_id);


--
-- Name: Sessions Sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: statengine
--

ALTER TABLE ONLY "Sessions"
    ADD CONSTRAINT "Sessions_pkey" PRIMARY KEY (id);


--
-- Name: Sessions Sessions_sid_key; Type: CONSTRAINT; Schema: public; Owner: statengine
--

ALTER TABLE ONLY "Sessions"
    ADD CONSTRAINT "Sessions_sid_key" UNIQUE (sid);


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: statengine
--

ALTER TABLE ONLY "Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: statengine
--

ALTER TABLE ONLY "Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (_id);


--
-- Name: Users Users_username_key; Type: CONSTRAINT; Schema: public; Owner: statengine
--

ALTER TABLE ONLY "Users"
    ADD CONSTRAINT "Users_username_key" UNIQUE (username);


--
-- Name: Users Users_fire_department__id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: statengine
--

ALTER TABLE ONLY "Users"
    ADD CONSTRAINT "Users_fire_department__id_fkey" FOREIGN KEY (fire_department__id) REFERENCES "FireDepartments"(_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--
