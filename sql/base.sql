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
-- Name: statengine; Type: DATABASE; Schema: -; Owner: root
--

CREATE DATABASE statengine WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';


ALTER DATABASE statengine OWNER TO root;

\connect statengine

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
    name character varying(255),
    email character varying(255),
    department character varying(255),
    role character varying(255) DEFAULT 'user'::character varying,
    password character varying(255),
    provider character varying(255),
    salt character varying(255),
    google json,
    github json
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
-- Name: Sessions id; Type: DEFAULT; Schema: public; Owner: statengine
--

ALTER TABLE ONLY "Sessions" ALTER COLUMN id SET DEFAULT nextval('"Sessions_id_seq"'::regclass);


--
-- Name: Users _id; Type: DEFAULT; Schema: public; Owner: statengine
--

ALTER TABLE ONLY "Users" ALTER COLUMN _id SET DEFAULT nextval('"Users__id_seq"'::regclass);



--
-- Name: Sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: statengine
--

SELECT pg_catalog.setval('"Sessions_id_seq"', 1, true);



--
-- Name: Users__id_seq; Type: SEQUENCE SET; Schema: public; Owner: statengine
--

SELECT pg_catalog.setval('"Users__id_seq"', 6, true);


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
-- PostgreSQL database dump complete
--
