--
-- PostgreSQL database dump
--

\restrict TGDhHrvQLUkyixPBAPhptGm4bCXANDLBHYMQwtFIsRD3Yj73qGHJgD8coKlxb0G

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS "FK_ff56834e735fa78a15d0cf21926";
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS "FK_f1d359a55923bb45b057fbdab0d";
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS "FK_e747534006c6e3c2f09939da60f";
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS "FK_cdb99c05982d5191ac8465ac010";
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS "FK_a6b3c434392f5d10ec171043666";
ALTER TABLE IF EXISTS ONLY public.profile DROP CONSTRAINT IF EXISTS "FK_a24972ebd73b106250713dcddd9";
ALTER TABLE IF EXISTS ONLY public."user" DROP CONSTRAINT IF EXISTS "FK_9466682df91534dd95e4dbaa616";
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS "FK_8679e2ff150ff0e253189ca0253";
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS "FK_84e765378a5f03ad9900df3a9ba";
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS "FK_7ed5659e7139fc8bc039198cc1f";
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS "FK_72679d98b31c737937b8932ebe6";
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS "FK_151b79a83ba240b0cb31b2302d1";
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS "FK_0c7bba48aac77ad13092685ba5b";
ALTER TABLE IF EXISTS ONLY public."user" DROP CONSTRAINT IF EXISTS "UQ_e12875dfb3b1d92d7d7c5377e22";
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS "UQ_c44ac33a05b144dd0d9ddcf9327";
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS "UQ_9007ffba411fd471dfe233dabfb";
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS "UQ_420d9f679d41281f282f5bc7d09";
ALTER TABLE IF EXISTS ONLY public.profile DROP CONSTRAINT IF EXISTS "REL_a24972ebd73b106250713dcddd";
ALTER TABLE IF EXISTS ONLY public."user" DROP CONSTRAINT IF EXISTS "REL_9466682df91534dd95e4dbaa61";
ALTER TABLE IF EXISTS ONLY public."user" DROP CONSTRAINT IF EXISTS "PK_cace4a159ff9f2512dd42373760";
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS "PK_942e8d8f5df86100471d2324643";
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS "PK_783e5111df14529ff6124351b16";
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS "PK_710e2d4957aa5878dfe94e4ac2f";
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS "PK_6fccf5ec03c172d27a28a82928b";
ALTER TABLE IF EXISTS ONLY public.banner DROP CONSTRAINT IF EXISTS "PK_6d9e2570b3d85ba37b681cd4256";
ALTER TABLE IF EXISTS ONLY public.profile DROP CONSTRAINT IF EXISTS "PK_3dd8bfc97e4a77c70971591bdcb";
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS "PK_24dbc6126a28ff948da33e97d3b";
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS "PK_231ae565c273ee700b283f15c1d";
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS "PK_0806c755e0aca124e67c0cf6d7d";
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS "PK_005269d8574e6fac0493715c308";
ALTER TABLE IF EXISTS public."user" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.support_tickets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.profile ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.user_id_seq;
DROP TABLE IF EXISTS public."user";
DROP SEQUENCE IF EXISTS public.support_tickets_id_seq;
DROP TABLE IF EXISTS public.support_tickets;
DROP TABLE IF EXISTS public.reviews;
DROP SEQUENCE IF EXISTS public.profile_id_seq;
DROP TABLE IF EXISTS public.profile;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.favorites;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.cart_items;
DROP TABLE IF EXISTS public.banner;
DROP TYPE IF EXISTS public.user_role_enum;
DROP TYPE IF EXISTS public.support_tickets_status_enum;
DROP TYPE IF EXISTS public.orders_status_enum;
DROP TYPE IF EXISTS public.orders_paymentmethod_enum;
DROP EXTENSION IF EXISTS "uuid-ossp";
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: orders_paymentmethod_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.orders_paymentmethod_enum AS ENUM (
    'card',
    'cash'
);


--
-- Name: orders_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.orders_status_enum AS ENUM (
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
);


--
-- Name: support_tickets_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.support_tickets_status_enum AS ENUM (
    'open',
    'in_progress',
    'resolved',
    'closed'
);


--
-- Name: user_role_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role_enum AS ENUM (
    'user',
    'admin'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: banner; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banner (
    id integer NOT NULL,
    title character varying(512) NOT NULL,
    subtitle character varying(1024) NOT NULL,
    "originalLang" character varying(10) DEFAULT 'ru'::character varying NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" integer NOT NULL,
    "productId" uuid NOT NULL,
    quantity integer NOT NULL,
    size character varying,
    color character varying,
    price integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    image character varying NOT NULL,
    slug character varying NOT NULL,
    "parentId" uuid
);


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorites (
    "userId" integer NOT NULL,
    "productId" uuid NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "orderId" uuid NOT NULL,
    "productId" uuid NOT NULL,
    quantity integer NOT NULL,
    size character varying,
    color character varying,
    price integer NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" integer NOT NULL,
    status public.orders_status_enum DEFAULT 'pending'::public.orders_status_enum NOT NULL,
    "deliveryStreet" character varying NOT NULL,
    "deliveryCity" character varying NOT NULL,
    "deliveryPostalCode" character varying NOT NULL,
    "deliveryCountry" character varying NOT NULL,
    "paymentMethod" public.orders_paymentmethod_enum NOT NULL,
    comment text,
    total integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    description text NOT NULL,
    price integer NOT NULL,
    "oldPrice" integer,
    images text[] DEFAULT '{}'::text[] NOT NULL,
    "categoryId" uuid NOT NULL,
    rating numeric(3,2),
    "reviewCount" integer DEFAULT 0 NOT NULL,
    "inStock" boolean DEFAULT true NOT NULL,
    "stockQuantity" integer,
    sizes text[],
    colors text[],
    brand character varying,
    sku character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile (
    id integer NOT NULL,
    "firstName" character varying NOT NULL,
    "lastName" character varying NOT NULL,
    "userId" integer
);


--
-- Name: profile_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.profile_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.profile_id_seq OWNED BY public.profile.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "productId" uuid NOT NULL,
    "userId" integer NOT NULL,
    rating integer NOT NULL,
    comment text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    subject character varying(255) NOT NULL,
    message text NOT NULL,
    status public.support_tickets_status_enum DEFAULT 'open'::public.support_tickets_status_enum NOT NULL,
    "adminResponse" text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: support_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.support_tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: support_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.support_tickets_id_seq OWNED BY public.support_tickets.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    role public.user_role_enum DEFAULT 'user'::public.user_role_enum NOT NULL,
    "isBanned" boolean DEFAULT false NOT NULL,
    "refreshToken" text,
    "tokenVersion" integer DEFAULT 0 NOT NULL,
    "resetPasswordToken" character varying,
    "tokenExpiredDate" timestamp without time zone,
    "isOAuthUser" boolean DEFAULT false NOT NULL,
    "profileId" integer
);


--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: profile id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile ALTER COLUMN id SET DEFAULT nextval('public.profile_id_seq'::regclass);


--
-- Name: support_tickets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets ALTER COLUMN id SET DEFAULT nextval('public.support_tickets_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Data for Name: banner; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.banner (id, title, subtitle, "originalLang", "updatedAt") FROM stdin;
1	Летняя распродажа	Скидки на все топики и трусы	ru	2026-04-22 20:26:39.686544
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_items (id, "userId", "productId", quantity, size, color, price, "createdAt") FROM stdin;
9a5afc80-0afc-4937-99b4-4476f5cf3c52	5	b0f01c47-640e-4c78-bb9c-d28802b1b76d	1	\N	\N	5990	2026-01-24 10:22:53.131903
0420e689-b1c4-4e39-b21c-212da0c595d8	5	e8dae0d0-f4cc-46d4-9e1d-2c19c0687ebc	1	45	Белый	15990	2026-01-24 10:23:05.407743
f6817efb-e390-49c1-a6a8-4637a720ae47	8	84c67271-ac6a-4eb1-9569-f5b1169fb143	1	44	Синий	7990	2026-02-12 13:25:37.413994
24eeca0c-d9b2-477c-8cbf-5568fc6c3a23	9	4935e0ef-83dc-40f1-99ff-daf4ad409927	1	XL	Белый	4999	2026-02-20 10:54:45.290328
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, image, slug, "parentId") FROM stdin;
01e7d653-d628-4ba5-8216-bbd792a6d9b4	Одежда	https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500	odezhda	\N
78a52362-8394-45f0-9179-9371d70ba32a	Обувь	https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500	obuv	\N
258e5b69-af25-4389-8571-8ee06bb0a879	Тренажеры	https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500	trenazhery	\N
ec47345a-80c0-4d60-ac49-217009028fee	Мячи	https://images.unsplash.com/photo-1614634713297-3a3b143f2a13?w=500	myachi	\N
8b2580bc-aad6-4aaf-beb1-9063cd6617ed	Аксессуары	https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500	aksessuary	\N
e179841f-b96b-49d1-9e27-141a2dc97612	Спортивное питание	https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500	sportivnoe-pitanie	\N
5e6c6f8e-72fc-4515-9f8e-73bf69bd6a00	Йога и фитнес	https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500	yoga-i-fitnes	\N
dbb020c0-bc75-4181-8c8c-02a68ce72649	Товары для зимних видов спорта	https://c.pxhere.com/photos/6e/54/boy_cold_goggles_kid_person_ski_skiing_snow-1367413.jpg!d	zimanisport	\N
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.favorites ("userId", "productId", "createdAt") FROM stdin;
3	1f8390af-ceb4-47a2-82ee-1dacf59168e4	2026-01-06 14:41:58.391896
1	a286785c-dea0-463e-ace5-15fe471bc2ba	2026-01-06 14:42:16.091647
1	e9f81fdf-b269-4035-a20d-f57865dd3bc3	2026-01-06 14:43:30.75586
1	1bb4bf1c-6b1e-4478-bf80-46ea1286fde1	2026-01-06 14:49:04.239927
3	13cba35b-d5af-4a87-8efa-d0ca40d0f223	2026-01-06 14:52:30.895599
3	582739bb-a26c-433d-9379-6ef2d2e64b95	2026-01-06 14:56:29.830702
3	ab3828d5-ed63-4641-9c3a-4f6b6b26c937	2026-01-06 16:03:10.719875
4	4935e0ef-83dc-40f1-99ff-daf4ad409927	2026-01-24 10:15:51.594746
4	13cba35b-d5af-4a87-8efa-d0ca40d0f223	2026-01-24 10:15:52.213581
4	1bb4bf1c-6b1e-4478-bf80-46ea1286fde1	2026-01-24 10:15:53.770606
4	b0f01c47-640e-4c78-bb9c-d28802b1b76d	2026-01-24 10:15:59.322891
6	e8dae0d0-f4cc-46d4-9e1d-2c19c0687ebc	2026-01-24 10:28:03.497761
6	c112da03-3dfe-4de0-afeb-692684e1e1f6	2026-01-24 10:41:17.973314
8	ed9bc415-5c28-4f22-b728-1b2b57cf88f5	2026-02-12 13:15:51.781337
1	961179e0-5ad7-4ddf-b9f5-724ab15f3656	2026-05-04 06:24:14.730603
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, "orderId", "productId", quantity, size, color, price) FROM stdin;
494d7f5a-21d1-498a-9f5e-416fc94f0535	b3ff846a-cf8b-42d5-8678-9809a6e748cf	13cba35b-d5af-4a87-8efa-d0ca40d0f223	1	\N	\N	1490
90e03d23-994e-4d52-8629-f02f23859f9f	97a6b0e3-e429-4812-a8d8-04a8ca60c3de	adb718a1-21e8-47f6-8503-1900d77ff895	1	\N	Прозрачный	890
1527d1ea-953b-4df4-8585-dfb40614981d	4eba1fa7-2700-4e23-b5ce-db79502e137e	13cba35b-d5af-4a87-8efa-d0ca40d0f223	1	\N	\N	1490
f80ab4f7-81a4-4317-9d6a-090b7a0ae904	a6d5a81a-9782-4578-9c46-465757f6a61b	cfb822ef-6362-4008-bc6b-a4fd1cced6ee	1	M	Белый	2990
20616639-630b-448d-8b90-a9fb90c1c82f	a6d5a81a-9782-4578-9c46-465757f6a61b	1bb4bf1c-6b1e-4478-bf80-46ea1286fde1	1	42	Белый	14990
275245df-41ff-4f21-9019-fd1769c17b3a	f200d213-756b-4cd3-b9b8-cdb617a69131	1bb4bf1c-6b1e-4478-bf80-46ea1286fde1	1	42	Белый	14990
e85316b6-6344-41d7-abe2-300374e6126f	f200d213-756b-4cd3-b9b8-cdb617a69131	0f7c2328-7a24-4d44-9145-939043790c88	1	XL	Серый	4990
1f224b82-3e7a-4a6d-b8e2-cdf7196d6d4b	ce87dd27-7944-442a-950e-a13c4b8333d5	1bb4bf1c-6b1e-4478-bf80-46ea1286fde1	1	42	Белый	14990
8e5148e5-83c8-436d-9962-1c94c082e7af	ce87dd27-7944-442a-950e-a13c4b8333d5	13cba35b-d5af-4a87-8efa-d0ca40d0f223	1	\N	\N	1490
2ae5d8a6-f43e-4223-b0a3-a82c186f8002	5b0f209c-d87f-430f-89f1-061893d6b35a	4935e0ef-83dc-40f1-99ff-daf4ad409927	1	L	Белый	5999
3d5f2517-b956-43e9-84f0-2352e8c46572	6668e378-1cf5-402d-a571-3544cb72b1e0	4935e0ef-83dc-40f1-99ff-daf4ad409927	2	XL	Белый	3997
0fe5d5c8-7b23-461d-8979-b136ec7b56ba	6668e378-1cf5-402d-a571-3544cb72b1e0	13cba35b-d5af-4a87-8efa-d0ca40d0f223	1	\N	\N	2499
d6a8cca2-1b80-4480-a1b5-234b8188fb9f	054185fb-f47a-4337-9167-015c503eb6c4	84c67271-ac6a-4eb1-9569-f5b1169fb143	1	44	Синий	7990
df6f06e9-3aea-46d0-9696-0b2c6e536b96	0eb1da94-b704-4b51-bef1-34e11869d2de	91da1b38-94e9-455a-877a-ed7f2e5084d6	1	\N	\N	12990
b413e80d-808f-4887-81ae-7ec30d391d5d	26cc6a43-f39e-47b0-a1ea-c30597142dae	c3864339-b907-4253-a3b1-1c410ae0d7a1	2	43	Черный	8990
8466722d-dcee-4f61-a4af-6ba97bbbecc5	e0cebe37-56b5-46fc-82ac-ed05928507cd	2c2bfbb9-4fe9-431b-a4aa-e4e0b09f0a2d	3	\N	\N	14990
e38f6adc-aa8f-46e0-ad24-3f97f7a92061	9d903dc0-8a67-4993-9529-d524a6d0f898	c3864339-b907-4253-a3b1-1c410ae0d7a1	1	44	Красный	8990
f463350f-67fe-4c08-9c74-6a2ffe26c15c	31f1cc1a-94f1-41cc-b978-a8a9ba7acfcd	4935e0ef-83dc-40f1-99ff-daf4ad409927	1	XL	Белый	4259
6844f03f-a7ac-49be-bebd-4fc33d6d3d3e	68e7a51e-aec3-44a1-9e59-ffa6bb33e587	4935e0ef-83dc-40f1-99ff-daf4ad409927	1	XL	Белый	4259
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, "userId", status, "deliveryStreet", "deliveryCity", "deliveryPostalCode", "deliveryCountry", "paymentMethod", comment, total, "createdAt") FROM stdin;
b3ff846a-cf8b-42d5-8678-9809a6e748cf	1	pending	ул. Пушкина 54	Москва	765568	Россия	card	\N	1490	2026-01-05 13:03:09.59167
97a6b0e3-e429-4812-a8d8-04a8ca60c3de	1	pending	Ул. Пушкина	Москва	37376	Россия	card	\N	890	2026-01-05 13:04:53.276038
4eba1fa7-2700-4e23-b5ce-db79502e137e	1	shipped	Ул Пушкина	Пррр	445566	Россия	cash	\N	1490	2026-01-05 13:14:28.437876
ce87dd27-7944-442a-950e-a13c4b8333d5	3	pending	Erx4x4x4	4c4x4x	55466	Россия	card	\N	16480	2026-01-06 15:14:20.189084
5b0f209c-d87f-430f-89f1-061893d6b35a	3	processing	Ftf5f5d	Tfttct	664655	Россия	card	\N	5999	2026-01-06 17:04:05.01241
f200d213-756b-4cd3-b9b8-cdb617a69131	1	shipped	Емкиеиеи	5п4п4	76567	Россия	card	\N	19980	2026-01-06 14:32:13.418755
a6d5a81a-9782-4578-9c46-465757f6a61b	1	delivered	ул влвлво	Москва	272721	Россия	card	\N	17980	2026-01-05 19:58:53.904471
6668e378-1cf5-402d-a571-3544cb72b1e0	4	pending	ул. Карла Маркса 34	Минск	123456	Беларусь	card	\N	10493	2026-01-24 10:15:38.591245
054185fb-f47a-4337-9167-015c503eb6c4	8	pending	Ул. Карла Маркса	Минск	626522	Беларусь	card	\N	7990	2026-02-12 13:04:54.590823
0eb1da94-b704-4b51-bef1-34e11869d2de	8	pending	Ул. Плеханова д.42 кв.34	Минск	346646	Беларусь	card	\N	12990	2026-02-12 13:17:37.669132
26cc6a43-f39e-47b0-a1ea-c30597142dae	1	delivered	Ул. Плеханова д.42 кв.34	Минск	346646	Беларусь	card	\N	17980	2026-02-16 10:59:58.27594
e0cebe37-56b5-46fc-82ac-ed05928507cd	9	cancelled	Njkk	Jjj	2273845	Россия	cash	\N	44970	2026-02-20 10:15:21.554613
9d903dc0-8a67-4993-9529-d524a6d0f898	9	cancelled	Hh	Jj	Vvjjk	Россия	card	\N	8990	2026-02-20 10:16:08.098298
31f1cc1a-94f1-41cc-b978-a8a9ba7acfcd	1	cancelled	Yyy	Hhh	3344	Россия	card	\N	4259	2026-05-04 08:43:21.401122
68e7a51e-aec3-44a1-9e59-ffa6bb33e587	1	pending	Ппппр	Ииро	666666	Россиярр	card	Нет	4259	2026-05-12 14:34:47.444952
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, description, price, "oldPrice", images, "categoryId", rating, "reviewCount", "inStock", "stockQuantity", sizes, colors, brand, sku, "createdAt", "updatedAt") FROM stdin;
cfb822ef-6362-4008-bc6b-a4fd1cced6ee	Футболка спортивная Nike Dri-FIT	Дышащая футболка с технологией Dri-FIT для отвода влаги. Идеальна для тренировок и активного отдыха.	2990	3990	{https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500,https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500}	01e7d653-d628-4ba5-8216-bbd792a6d9b4	4.50	23	t	50	{S,M,L,XL,XXL}	{Черный,Белый,Серый,Синий}	Nike	NKE-TSH-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
b2c4e594-93f7-4481-adde-b5e362decff9	Толстовка Puma Classic	Теплая толстовка с капюшоном. Отлично подходит для тренировок на свежем воздухе.	4990	5990	{https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500}	01e7d653-d628-4ba5-8216-bbd792a6d9b4	4.70	31	t	20	{M,L,XL,XXL}	{Черный,Серый,Синий}	Puma	PMA-HOD-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
3d35818d-93ea-43cd-809e-2de8fa4ad228	Легинсы Reebok Training	Эластичные легинсы для тренировок. Обеспечивают свободу движений и комфорт.	3490	\N	{https://images.unsplash.com/photo-1591088398332-8a7791972843?w=500}	01e7d653-d628-4ba5-8216-bbd792a6d9b4	4.40	19	t	28	{S,M,L}	{Черный,Серый,Розовый}	Reebok	RBK-LEG-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
8d18c302-79e5-4f6f-b60e-0ba50f6314d7	Спортивный костюм Nike Tech	Современный спортивный костюм из высокотехнологичной ткани. Включает куртку и брюки.	8990	10990	{https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500}	01e7d653-d628-4ba5-8216-bbd792a6d9b4	4.60	42	t	15	{M,L,XL}	{Черный,Серый}	Nike	NKE-SET-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
9c050fc1-c854-4044-b788-f0bda453622b	Майка для фитнеса Under Armour	Легкая майка из влагоотводящей ткани. Идеальна для интенсивных тренировок.	1990	\N	{https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500}	01e7d653-d628-4ba5-8216-bbd792a6d9b4	4.50	27	t	40	{S,M,L,XL}	{Черный,Белый,Красный}	Under Armour	UAR-TNK-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
c3864339-b907-4253-a3b1-1c410ae0d7a1	Кроссовки для зала Puma RS-X	Стильные кроссовки для тренировок в зале. Отличная поддержка стопы.	8990	10990	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	78a52362-8394-45f0-9179-9371d70ba32a	4.60	28	t	18	{40,41,42,43,44}	{Черный,Белый,Красный}	Puma	PMA-SHO-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
84c67271-ac6a-4eb1-9569-f5b1169fb143	Кроссовки для тенниса Wilson	Специализированные кроссовки для игры в теннис. Отличное сцепление с покрытием.	7990	\N	{https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500}	78a52362-8394-45f0-9179-9371d70ba32a	4.50	14	t	10	{41,42,43,44}	{Белый,Синий}	Wilson	WLS-SHO-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
410020c3-8640-43dd-9ac0-d814b6b66524	Кроссовки для бега Asics Gel	Профессиональные беговые кроссовки с гелевой амортизацией. Для длительных дистанций.	11990	\N	{https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500}	78a52362-8394-45f0-9179-9371d70ba32a	4.70	56	t	14	{40,41,42,43,44}	{Синий,Белый,Оранжевый}	Asics	ASC-SHO-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
91da1b38-94e9-455a-877a-ed7f2e5084d6	Скамья для жима лежа	Регулируемая скамья для жима лежа. Угол наклона от -20° до +85°. Максимальный вес 300 кг.	12990	\N	{https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500}	258e5b69-af25-4389-8571-8ee06bb0a879	4.60	22	t	6	\N	\N	Body-Solid	BDS-BEN-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
ed9bc415-5c28-4f22-b728-1b2b57cf88f5	Гантели разборные 2x20 кг	Набор разборных гантелей с блинами. Регулируемый вес от 2 до 20 кг на каждую гантель.	8999	10990	{https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500}	258e5b69-af25-4389-8571-8ee06bb0a879	4.70	35	t	8	\N	\N	ProForm	PRF-DUM-001	2026-01-03 20:22:57.755887	2026-01-06 17:06:06.8348
1bb4bf1c-6b1e-4478-bf80-46ea1286fde1	Беговые кроссовки Adidas Ultraboost	Профессиональные беговые кроссовки с технологией Boost. Идеальны для длительных пробежек.	19998	\N	{https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500}	78a52362-8394-45f0-9179-9371d70ba32a	5.00	2	t	12	{39,40,41,42,43,44,45}	{Черный,Белый}	Adidas	ADS-SHO-001	2026-01-03 20:22:57.755887	2026-01-06 16:52:21.583505
131a9ca7-4260-4f24-a7a4-532acde7668a	Шорты Adidas Essentials	Удобные спортивные шорты из мягкой ткани. Подходят для бега, тренировок и повседневной носки.	2491	2900	{https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500}	01e7d653-d628-4ba5-8216-bbd792a6d9b4	4.30	15	t	35	{S,M,L,XL}	{Черный,Серый}	Adidas	ADS-SHR-001	2026-01-03 20:22:57.755887	2026-01-06 13:53:24.696231
e8dae0d0-f4cc-46d4-9e1d-2c19c0687ebc	Кроссовки для баскетбола Jordan	Легендарные кроссовки для баскетбола. Максимальная поддержка и амортизация.	15990	17990	{https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500}	78a52362-8394-45f0-9179-9371d70ba32a	5.00	1	t	8	{42,43,44,45,46}	{Черный,Красный,Белый}	Jordan	JRD-SHO-001	2026-01-03 20:22:57.755887	2026-01-24 10:28:52.535525
961179e0-5ad7-4ddf-b9f5-724ab15f3656	Кроссовки Nike Air Max 270	Спортивные кроссовки с технологией Air Max. Максимальный комфорт и амортизация.	12990	14990	{https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500,https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	78a52362-8394-45f0-9179-9371d70ba32a	5.00	1	t	15	{40,41,42,43,44,45}	{Черный,Белый,Синий}	Nike	NKE-SHO-001	2026-01-03 20:22:57.755887	2026-01-24 10:42:16.251457
c4f1c8f9-4379-4b6a-a0b8-c35a6c0ea774	Беговая дорожка ProForm 500	Электрическая беговая дорожка с дисплеем. Максимальная скорость 16 км/ч. Складная конструкция.	89990	99990	{https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500}	258e5b69-af25-4389-8571-8ee06bb0a879	4.80	41	t	3	\N	\N	ProForm	PRF-TRD-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
5486948b-eef3-431e-b98f-edb36fc985a0	Велотренажер магнитный	Магнитный велотренажер с 8 уровнями нагрузки. LCD дисплей с показателями тренировки.	24990	\N	{https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500}	258e5b69-af25-4389-8571-8ee06bb0a879	4.50	27	t	4	\N	\N	Kettler	KET-BIK-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
e751c548-32e9-46ad-8236-bd6b8f4ec4ba	Эллиптический тренажер	Эллиптический тренажер для кардио тренировок. Низкая ударная нагрузка на суставы.	49990	59990	{https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500}	258e5b69-af25-4389-8571-8ee06bb0a879	4.70	19	t	2	\N	\N	NordicTrack	NTC-ELP-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
bcaf06be-13b7-4663-852c-47341dbcc86e	Гриф олимпийский 20 кг	Профессиональный олимпийский гриф для силовых тренировок. Длина 220 см.	7990	\N	{https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500}	258e5b69-af25-4389-8571-8ee06bb0a879	4.80	25	t	12	\N	\N	Rogue	ROG-BAR-002	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
3b7dd0dc-9af2-446b-ac57-a38bd20b53b0	Футбольный мяч Adidas Tiro	Профессиональный футбольный мяч для тренировок. Размер 5. Водонепроницаемое покрытие.	2990	3990	{https://images.unsplash.com/photo-1614634713297-3a3b143f2a13?w=500,https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=500}	ec47345a-80c0-4d60-ac49-217009028fee	4.60	33	t	25	\N	\N	Adidas	ADS-BAL-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
f661ebee-845d-4c2b-bbff-027ca68ed8eb	Баскетбольный мяч Spalding	Официальный баскетбольный мяч Spalding. Размер 7. Кожаное покрытие для профессиональной игры.	4990	\N	{https://images.unsplash.com/photo-1614634713297-3a3b143f2a13?w=500}	ec47345a-80c0-4d60-ac49-217009028fee	4.80	29	t	15	\N	\N	Spalding	SPL-BAL-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
bf6526bf-51fb-4824-bd90-db8bad88eea5	Волейбольный мяч Mikasa	Профессиональный волейбольный мяч Mikasa. Размер 5. Используется на международных соревнованиях.	3490	\N	{https://images.unsplash.com/photo-1614634713297-3a3b143f2a13?w=500}	ec47345a-80c0-4d60-ac49-217009028fee	4.70	24	t	20	\N	\N	Mikasa	MIK-BAL-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
d3743c94-d15e-4865-ba8d-80c2d2473949	Мяч для гандбола Select	Профессиональный мяч для гандбола. Размер 3. Отличное сцепление.	2490	\N	{https://images.unsplash.com/photo-1614634713297-3a3b143f2a13?w=500}	ec47345a-80c0-4d60-ac49-217009028fee	4.50	13	t	18	\N	\N	Select	SEL-BAL-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
eb4f64a0-0d35-4bad-aef1-08e7109beff2	Мяч для водного поло Mikasa	Специализированный мяч для водного поло. Водонепроницаемое покрытие.	2990	\N	{https://images.unsplash.com/photo-1614634713297-3a3b143f2a13?w=500}	ec47345a-80c0-4d60-ac49-217009028fee	4.30	8	t	10	\N	\N	Mikasa	MIK-BAL-002	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
fce6e329-cdd7-4a06-9347-582fee9a6554	Спортивная сумка Nike Brasilia	Вместительная спортивная сумка для тренировок. Отделение для обуви. Водонепроницаемый материал.	3990	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.50	21	t	30	\N	{Черный,Серый,Синий}	Nike	NKE-BAG-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
adb718a1-21e8-47f6-8503-1900d77ff895	Бутылка для воды 750 мл	Спортивная бутылка из тритана. Не содержит BPA. Удобная крышка с клапаном.	890	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.60	45	t	100	\N	{Прозрачный,Синий,Розовый,Черный}	CamelBak	CMB-BOT-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
350f33fd-5ecb-4d06-8d7f-6e493968b61e	Перчатки для фитнеса	Тренировочные перчатки с защитой ладоней. Предотвращают мозоли и улучшают хват.	1490	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.40	19	t	40	{S,M,L,XL}	\N	Harbinger	HRB-GLO-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
b878ae3e-ad54-431d-9a3c-f36fd3bb59ed	Коврик для йоги 6 мм	Антискользящий коврик для йоги и фитнеса. Толщина 6 мм. Легко моется.	1990	2490	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.70	38	t	35	\N	{Фиолетовый,Синий,Розовый,Серый}	Liforme	LIF-MAT-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
bc01928a-2959-47f4-82cd-afef8f170bfb	Ремень для тяжелой атлетики	Кожаный ремень для пауэрлифтинга и тяжелой атлетики. Ширина 10 см. Регулируемая застежка.	3490	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.80	26	t	15	{S,M,L,XL}	\N	Rogue	ROG-BEL-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
e235221b-e3ae-4345-bf59-78baa55d119d	Напульсники Nike	Спортивные напульсники из дышащего материала. Впитывают влагу и защищают запястья.	690	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.30	17	t	60	\N	{Черный,Белый,Красный}	Nike	NKE-WRB-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
582739bb-a26c-433d-9379-6ef2d2e64b95	Гиря 16 кг	Чугунная гиря для функциональных тренировок. Идеальна для развития силы и выносливости.	2990	\N	{https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500}	258e5b69-af25-4389-8571-8ee06bb0a879	5.00	1	t	20	\N	\N	Rogue	ROG-KET-001	2026-01-03 20:22:57.755887	2026-01-06 15:06:28.205701
a948bc42-f808-42ba-907d-ee2078663617	Мяч для регби Gilbert	Профессиональный мяч для регби. Размер 5. Водонепроницаемое покрытие.	3990	\N	{https://images.unsplash.com/photo-1614634713297-3a3b143f2a13?w=500}	ec47345a-80c0-4d60-ac49-217009028fee	5.00	1	t	12	\N	\N	Gilbert	GLB-BAL-001	2026-01-03 20:22:57.755887	2026-01-06 20:09:17.724014
69fe2b1d-7b70-4fe1-b68d-348a1bc7dacc	Спортивные очки Oakley	Защитные спортивные очки с поляризованными линзами. Идеальны для бега и велоспорта.	5990	7990	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.70	34	t	12	\N	\N	Oakley	OAK-GLS-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
5a78f7c2-da8f-4fb7-a93e-d2a6e23a940f	Шапка спортивная Adidas	Теплая спортивная шапка из флиса. Идеальна для тренировок на свежем воздухе.	1490	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.40	22	t	25	\N	{Черный,Серый,Синий}	Adidas	ADS-CAP-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
2f4e251f-b51f-40ee-bf97-d9c5d86a8882	BCAA 2:1:1 300 г	Аминокислоты с разветвленной цепью. Ускоряют восстановление после тренировок.	2490	\N	{https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500}	e179841f-b96b-49d1-9e27-141a2dc97612	4.60	43	t	25	\N	\N	Scivation	SCI-BCA-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
c0a029ca-444d-4fbf-82a9-ad467f25126a	Гейнер Serious Mass 5.4 кг	Высококалорийный гейнер для набора массы. 1250 калорий на порцию. Ванильный вкус.	5990	\N	{https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500}	e179841f-b96b-49d1-9e27-141a2dc97612	4.80	67	t	12	\N	\N	Optimum Nutrition	OPT-GAI-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
ae357656-0230-44f6-b4ff-28447cae997d	Предтренировочный комплекс C4	Энергетический комплекс перед тренировкой. Повышает выносливость и концентрацию.	3490	\N	{https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500}	e179841f-b96b-49d1-9e27-141a2dc97612	4.50	34	t	18	\N	\N	Cellucor	CEL-PRE-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
3b805d44-1a8b-45bf-b88b-d6a0efa14fad	Протеиновые батончики Quest 12 шт	Высокобелковые батончики с низким содержанием сахара. 20 г белка на батончик.	1990	\N	{https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500}	e179841f-b96b-49d1-9e27-141a2dc97612	4.60	58	t	40	\N	\N	Quest Nutrition	QST-BAR-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
ac8f45aa-c80d-4d5a-9a77-0a0cea5ed096	L-карнитин 500 мл	Жидкий L-карнитин для повышения выносливости и сжигания жира. Вкус лимона.	1290	\N	{https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500}	e179841f-b96b-49d1-9e27-141a2dc97612	4.40	29	t	35	\N	\N	Universal Nutrition	UNI-CAR-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
fa54c079-c54e-4622-be4e-b3730698be80	Глютамин 500 г	Порошковый глютамин для восстановления мышц. Ускоряет заживление после тренировок.	1990	\N	{https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500}	e179841f-b96b-49d1-9e27-141a2dc97612	4.50	31	t	22	\N	\N	Optimum Nutrition	OPT-GLU-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
b16874ba-bb64-489a-8632-bcf375a94fc9	Йога блоки 2 шт	Набор из 2 блоков для йоги. Пенопласт высокой плотности. Размер 23x15x7.5 см.	1490	\N	{https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500}	5e6c6f8e-72fc-4515-9f8e-73bf69bd6a00	4.60	28	t	25	\N	{Фиолетовый,Синий,Розовый}	Gaiam	GAI-BLO-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
b2fb39d4-3945-4fb3-a8b8-b65d9585e861	Ремень для йоги 3 м	Прочный ремень для йоги с пряжкой. Помогает в выполнении сложных асан.	990	\N	{https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500}	5e6c6f8e-72fc-4515-9f8e-73bf69bd6a00	4.50	22	t	40	\N	{Фиолетовый,Синий,Розовый}	Manduka	MAN-BEL-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
72bfae71-4a20-4836-9c80-7e8086ebd6a4	Эластичная лента сопротивления	Набор эластичных лент разной жесткости. Для силовых тренировок и растяжки.	1290	\N	{https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500}	5e6c6f8e-72fc-4515-9f8e-73bf69bd6a00	4.40	19	t	35	\N	\N	TheraBand	THB-BAN-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
aa3e2f51-07d2-494c-9304-e11601aa2ff1	Мяч для пилатеса 55 см	Гимнастический мяч для пилатеса и фитнеса. Выдерживает до 300 кг. Антиразрывная технология.	1990	\N	{https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500}	5e6c6f8e-72fc-4515-9f8e-73bf69bd6a00	4.70	31	t	20	\N	{Синий,Красный,Фиолетовый}	Trideer	TRI-BAL-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
b26664fd-e0c8-4025-b7ea-e81ca9537d9d	Ролик для массажа	Фоам роллер для массажа мышц. Снимает напряжение и улучшает гибкость.	1490	\N	{https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500}	5e6c6f8e-72fc-4515-9f8e-73bf69bd6a00	4.50	37	t	30	\N	{Черный,Синий,Розовый}	TriggerPoint	TPT-ROL-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
c90d207d-d0b1-414f-bfa9-9ffb67a2144f	Медицинский мяч 4 кг	Утяжеленный мяч для функциональных тренировок. Развивает силу и координацию.	2990	\N	{https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500}	5e6c6f8e-72fc-4515-9f8e-73bf69bd6a00	4.40	20	t	15	\N	\N	Rage	RGE-MED-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
a286785c-dea0-463e-ace5-15fe471bc2ba	Протеин Whey Gold Standard 2.27 кг	Сывороточный протеин премиум качества. 24 г белка на порцию. Шоколадный вкус.	4990	5990	{https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500}	e179841f-b96b-49d1-9e27-141a2dc97612	5.00	1	t	20	\N	\N	Optimum Nutrition	OPT-PRO-001	2026-01-03 20:22:57.755887	2026-01-06 14:24:37.338547
c112da03-3dfe-4de0-afeb-692684e1e1f6	Коврик для йоги премиум 5 мм	Профессиональный коврик для йоги с выравнивающими линиями. Экологичный материал TPE.	4990	\N	{https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500}	5e6c6f8e-72fc-4515-9f8e-73bf69bd6a00	4.00	1	t	15	\N	{Фиолетовый,Бирюзовый,Розовый}	Liforme	LIF-YOG-001	2026-01-03 20:22:57.755887	2026-02-16 11:01:47.013691
15147fd1-b13b-4827-ae86-0a6aea183ba6	Кроссовки для ходьбы New Balance	Удобные кроссовки для ходьбы и повседневной носки. Отличная амортизация.	6990	\N	{https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500}	78a52362-8394-45f0-9179-9371d70ba32a	4.60	48	t	22	{39,40,41,42,43,44}	{Серый,Черный,Белый}	New Balance	NB-SHO-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
dffc2a68-55f4-44e9-8eac-286c7235fc73	Кроссовки для трейлраннинга Salomon	Профессиональные кроссовки для бега по пересеченной местности. Отличное сцепление.	10990	\N	{https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500}	78a52362-8394-45f0-9179-9371d70ba32a	4.80	35	t	10	{40,41,42,43,44}	{Черный,Синий}	Salomon	SAL-SHO-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
bfe78825-0054-40ac-bca4-e7e92db4a41f	Шорты для плавания Speedo	Профессиональные плавки для бассейна. Быстросохнущий материал.	1990	\N	{https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500}	01e7d653-d628-4ba5-8216-bbd792a6d9b4	4.50	18	t	30	{S,M,L,XL}	{Синий,Черный}	Speedo	SPD-SHR-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
a17497de-2a13-42ba-9568-a8201f94faf3	Купальник спортивный Arena	Женский спортивный купальник для плавания. Облегающий крой для минимального сопротивления.	3490	\N	{https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500}	01e7d653-d628-4ba5-8216-bbd792a6d9b4	4.60	26	t	20	{XS,S,M,L}	{Синий,Черный,Розовый}	Arena	ARN-SWI-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
90cec2cb-1c16-499c-a185-fe300b8ab2f0	Очки для плавания Speedo	Профессиональные очки для плавания с антизапотевающим покрытием.	1490	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.50	32	t	45	\N	{Синий,Черный,Прозрачный}	Speedo	SPD-GLS-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
0030c005-d896-498c-8972-f215c7a664b2	Шапочка для плавания Silicone	Силиконовая шапочка для плавания. Защищает волосы от хлора.	690	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.40	28	t	50	\N	{Синий,Черный,Розовый}	Speedo	SPD-CAP-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
2b9a0682-8175-48ac-87d1-d1c3b8b9e5d2	Ласты для плавания Cressi	Профессиональные ласты для плавания. Улучшают скорость и эффективность гребка.	3990	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.70	19	t	12	{S,M,L}	\N	Cressi	CRE-FIN-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
f3f3bd17-0da1-4868-b8bf-fce51b8f0cf8	Доска для плавания	Плавательная доска для тренировок. Помогает отрабатывать технику плавания.	1290	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.30	15	t	25	\N	{Синий,Желтый}	Speedo	SPD-BRD-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
16e6f20c-9105-4c71-ad3a-052726ad400e	Ракетка для бадминтона Yonex	Легкая ракетка для бадминтона. Идеальна для начинающих и продвинутых игроков.	3490	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.60	23	t	15	\N	\N	Yonex	YON-RAC-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
88cae981-1e3d-4527-bff4-98c5dc6ceace	Воланы для бадминтона Yonex	Набор из 12 воланов для бадминтона. Высокое качество и долговечность.	1290	\N	{https://images.unsplash.com/photo-1614634713297-3a3b143f2a13?w=500}	ec47345a-80c0-4d60-ac49-217009028fee	4.50	17	t	30	\N	\N	Yonex	YON-SHU-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
ad3b1fdb-b6e9-4d47-9d0e-fd8b10d8d9fb	Скакалка скоростная	Профессиональная скакалка для тренировок. Регулируемая длина. Отлична для кардио.	890	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.40	21	t	40	\N	{Черный,Красный,Синий}	Rogue	ROG-JMP-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
40bdf902-1e8e-40d2-b5e1-2650d949ce9d	Гиря 24 кг	Чугунная гиря для продвинутых тренировок. Развивает силу всего тела.	3990	\N	{https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500}	258e5b69-af25-4389-8571-8ee06bb0a879	4.70	28	t	12	\N	\N	Rogue	ROG-KET-002	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
07725dd2-37c6-4380-ab6f-3c18d5d5f67d	Гиря 32 кг	Тяжелая гиря для опытных спортсменов. Максимальная нагрузка на мышцы.	4990	\N	{https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500}	258e5b69-af25-4389-8571-8ee06bb0a879	4.80	15	t	6	\N	\N	Rogue	ROG-KET-003	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
2d2dfc92-a398-4f62-bd41-95e5f691a4c3	Блины для штанги 20 кг (2 шт)	Набор из 2 блинов по 20 кг. Для олимпийской штанги. Чугунные.	4990	\N	{https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500}	258e5b69-af25-4389-8571-8ee06bb0a879	4.60	20	t	10	\N	\N	Rogue	ROG-PLT-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
d443c976-c989-4136-af38-cea34955db93	Блины для штанги 10 кг (2 шт)	Набор из 2 блинов по 10 кг. Для олимпийской штанги. Чугунные.	2990	\N	{https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500}	258e5b69-af25-4389-8571-8ee06bb0a879	4.50	18	t	15	\N	\N	Rogue	ROG-PLT-002	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
a77faaaf-e4b7-4c72-8e17-e995f4a53bed	Турник настенный	Прочный настенный турник для подтягиваний. Выдерживает до 200 кг.	3990	\N	{https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500}	258e5b69-af25-4389-8571-8ee06bb0a879	4.70	29	t	8	\N	\N	Rogue	ROG-PUL-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
3b4e9726-d53d-4e31-b281-ec45c7d37d67	Брусья для отжиманий	Регулируемые брусья для отжиманий. Развивают мышцы груди и трицепсов.	2990	\N	{https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500}	258e5b69-af25-4389-8571-8ee06bb0a879	4.60	24	t	12	\N	\N	Body-Solid	BDS-DIP-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
3252e9af-aa5c-4c74-8c6d-e9453ab6d303	Мяч для фитбола 65 см	Большой гимнастический мяч для фитнеса и реабилитации. Выдерживает до 300 кг.	2490	\N	{https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500}	5e6c6f8e-72fc-4515-9f8e-73bf69bd6a00	4.60	26	t	18	\N	{Синий,Красный,Фиолетовый}	Trideer	TRI-BAL-002	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
416c60db-16cc-4ee0-8873-5e83ce7dc0b1	Утяжелители для ног 2x2 кг	Набор утяжелителей для ног. Регулируемые ремни. Для кардио и силовых тренировок.	1990	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.50	19	t	20	\N	\N	ProForm	PRF-WGT-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
e9f81fdf-b269-4035-a20d-f57865dd3bc3	Утяжелители для рук 2x1 кг	Легкие утяжелители для рук. Идеальны для кардио тренировок и аэробики.	1490	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.40	16	t	25	\N	\N	ProForm	PRF-WGT-002	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
93fa6a5e-7ba3-4ddb-9bf8-13c9675e936e	Спортивный рюкзак Adidas	Вместительный спортивный рюкзак с отделениями. Идеален для походов в спортзал.	3490	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.50	33	t	28	\N	{Черный,Серый,Синий}	Adidas	ADS-BAG-002	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
7a8d04fe-49e6-4812-a78b-cf4dc5cedcd2	Полотенце спортивное микрофибра	Быстросохнущее полотенце из микрофибры. Компактное и легкое.	990	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.30	27	t	60	\N	{Синий,Серый,Черный}	Nike	NKE-TWL-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
79ac3c67-98c1-4507-a8b0-b3648a9daa68	Замок для шкафчика	Надежный замок для спортивного шкафчика. Комбинационный.	490	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.20	14	t	80	\N	\N	Master Lock	MLK-LCK-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
b0f01c47-640e-4c78-bb9c-d28802b1b76d	Протеин изолят 2 кг	Изолят сывороточного протеина. 27 г белка на порцию. Минимум углеводов и жиров.	5990	6990	{https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500}	e179841f-b96b-49d1-9e27-141a2dc97612	4.80	72	t	16	\N	\N	Dymatize	DYM-ISO-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
7030c545-6498-499d-9c41-41d3b85da7f8	Казеиновый протеин 2.27 кг	Медленный протеин для приема перед сном. Обеспечивает длительное питание мышц.	5490	\N	{https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500}	e179841f-b96b-49d1-9e27-141a2dc97612	4.70	54	t	14	\N	\N	Optimum Nutrition	OPT-CAS-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
6a78a93b-17ca-4ba1-b072-df77cd38600d	Витамин D3 5000 МЕ	Высокодозированный витамин D3 для поддержания иммунитета и здоровья костей.	890	\N	{https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500}	e179841f-b96b-49d1-9e27-141a2dc97612	4.60	68	t	50	\N	\N	Now Foods	NOW-VIT-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
d29683a4-c715-42b4-8453-0d6ef8f5bf2a	Мультивитамины для спортсменов	Комплекс витаминов и минералов для активных людей. Повышает энергию и выносливость.	1990	\N	{https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500}	e179841f-b96b-49d1-9e27-141a2dc97612	4.60	51	t	30	\N	\N	Optimum Nutrition	OPT-MUL-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
165ba590-9123-4a11-8b9a-cab43846e46e	ZMA комплекс	Комплекс цинка, магния и витамина B6. Улучшает сон и восстановление.	1790	\N	{https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500}	e179841f-b96b-49d1-9e27-141a2dc97612	4.50	38	t	25	\N	\N	Optimum Nutrition	OPT-ZMA-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
537a17df-70cd-4347-a9c0-b3c565b9b6d1	Энергетический гель GU	Быстроусвояемый энергетический гель для бегунов. 100 калорий на пакетик.	190	\N	{https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500}	e179841f-b96b-49d1-9e27-141a2dc97612	4.40	42	t	100	\N	\N	GU Energy	GUE-GEL-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
993e898a-d6f9-45d3-a730-1d9e80a4f211	Изотоник Powerade	Спортивный напиток для восстановления электролитов. Восполняет потери при тренировках.	129	\N	{https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500}	e179841f-b96b-49d1-9e27-141a2dc97612	4.30	29	t	200	\N	\N	Powerade	PWR-ISO-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
18e9e5ab-cf26-433a-9a4c-8d3b700a48e8	Бинты для запястий	Эластичные бинты для защиты запястий при тяжелых упражнениях. Длина 1.5 м.	790	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.50	22	t	35	\N	\N	Harbinger	HRB-WRP-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
51d041cb-b770-4f09-a9d5-39b5570fc59a	Коленные бинты	Поддерживающие бинты для коленей. Защищают суставы при приседаниях и жиме ногами.	1490	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.70	31	t	20	\N	\N	SBD	SBD-KNE-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
457e5483-72d5-458f-ad6d-993a55ac99da	Мел для рук	Спортивный мел для улучшения хвата. Предотвращает скольжение при подтягиваниях.	390	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.40	18	t	50	\N	\N	Rogue	ROG-CHL-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
ab3828d5-ed63-4641-9c3a-4f6b6b26c937	Таймер для тренировок	Спортивный таймер с большим дисплеем. Для интервальных тренировок и табата.	1990	\N	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	4.60	25	t	15	\N	\N	Gymboss	GYM-TIM-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
8d076904-951c-48ff-9e4d-f9823921dd9c	Пуловер для тренировок Nike	Теплый пуловер из флиса. Идеален для тренировок на свежем воздухе в прохладную погоду.	5990	7490	{https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500}	01e7d653-d628-4ba5-8216-bbd792a6d9b4	4.60	39	t	18	{M,L,XL,XXL}	{Черный,Серый,Синий}	Nike	NKE-PUL-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
0f7c2328-7a24-4d44-9145-939043790c88	Ветровка Adidas	Легкая ветровка с капюшоном. Водонепроницаемая и ветрозащитная.	4990	\N	{https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500}	01e7d653-d628-4ba5-8216-bbd792a6d9b4	4.50	28	t	22	{S,M,L,XL}	{Черный,Синий,Серый}	Adidas	ADS-JKT-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
5835f200-fbf4-436a-9e16-5660e5aaa6b7	Носки спортивные Nike Dri-FIT	Влагоотводящие носки для спорта. Предотвращают образование мозолей.	990	\N	{https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500}	01e7d653-d628-4ba5-8216-bbd792a6d9b4	4.40	36	t	80	{39-42,43-46}	{Белый,Черный,Серый}	Nike	NKE-SOC-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
1f8390af-ceb4-47a2-82ee-1dacf59168e4	Термобелье Under Armour	Комплект термобелья для холодной погоды. Сохраняет тепло и отводит влагу.	6990	8990	{https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500}	01e7d653-d628-4ba5-8216-bbd792a6d9b4	4.70	44	t	12	{M,L,XL}	{Черный,Серый}	Under Armour	UAR-TRM-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
d9904b04-e894-4957-bed3-13b6b9ddc183	Штаны для бега Nike	Облегающие штаны для бега. Влагоотводящий материал и светоотражающие элементы.	4490	\N	{https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500}	01e7d653-d628-4ba5-8216-bbd792a6d9b4	4.60	33	t	16	{S,M,L,XL}	{Черный,Серый}	Nike	NKE-PNT-001	2026-01-03 20:22:57.755887	2026-01-03 20:22:57.755887
2c2bfbb9-4fe9-431b-a4aa-e4e0b09f0a2d	Штанга олимпийская 20 кг	Профессиональная олимпийская штанга для силовых тренировок. Выдерживает до 500 кг.	14990	\N	{https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500}	258e5b69-af25-4389-8571-8ee06bb0a879	4.00	1	t	5	\N	\N	Rogue	ROG-BAR-001	2026-01-03 20:22:57.755887	2026-01-05 14:12:19.700482
1e0c02a7-3a7a-4753-85af-9f2fef223883	Теннисный мяч Wilson Pro Staff	Набор из 4 теннисных мячей Wilson. Официальный мяч для турниров ATP.	801	890	{https://images.unsplash.com/photo-1614634713297-3a3b143f2a13?w=500}	ec47345a-80c0-4d60-ac49-217009028fee	4.50	16	t	50	\N	\N	Wilson	WLS-BAL-001	2026-01-03 20:22:57.755887	2026-01-06 14:07:44.704923
d9a396f1-0230-4d58-b2b4-417e8bc1d82a	Ракетка для тенниса Wilson Blade	Профессиональная теннисная ракетка. Баланс контроля и мощности.	8990	10990	{https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500}	8b2580bc-aad6-4aaf-beb1-9063cd6617ed	3.00	1	t	8	\N	\N	Wilson	WLS-RAC-001	2026-01-03 20:22:57.755887	2026-01-06 15:14:02.718004
db39a38d-f17b-4403-94be-0c19c4422d2b	Омега-3 1000 мг	Высококачественные омега-3 жирные кислоты. Поддерживают здоровье сердца и суставов.	1799	\N	{https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500}	e179841f-b96b-49d1-9e27-141a2dc97612	4.70	45	t	40	\N	\N	Nordic Naturals	NNC-OMG-001	2026-01-03 20:22:57.755887	2026-01-06 16:37:03.35841
13cba35b-d5af-4a87-8efa-d0ca40d0f223	Креатин моногидрат 500 г	Чистый креатин моногидрат без добавок. Повышает силу и выносливость.	7099	8000	{https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500}	e179841f-b96b-49d1-9e27-141a2dc97612	3.50	2	t	30	\N	\N	Universal Nutrition	UNI-CRE-001	2026-01-03 20:22:57.755887	2026-02-16 11:04:52.221438
4935e0ef-83dc-40f1-99ff-daf4ad409927	Лыжи 	Лыжи горные	4259	7099	{"data:image/jpeg;base64,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"}	dbb020c0-bc75-4181-8c8c-02a68ce72649	5.00	1	t	20	{S,M,L,XL}	{Черный,Белый}	Adidas	lishi	2026-01-06 16:42:00.860236	2026-02-20 10:58:56.905927
\.


--
-- Data for Name: profile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profile (id, "firstName", "lastName", "userId") FROM stdin;
6	Nikitaffffff	Grusha	6
7	Nikitafffuuuu	Grusha	7
8	Niki	Grusha	8
2	Nikig	Grusha	2
3	Nikit	Grushat	3
1	Nikitfgff	Grushat	1
4	Nikita	Grusha	4
5	Nikitf	Grushat	5
9	Nikita	Grusha	9
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, "productId", "userId", rating, comment, "createdAt", "updatedAt") FROM stdin;
ca7638af-e876-4fb4-8936-5308ff414020	2c2bfbb9-4fe9-431b-a4aa-e4e0b09f0a2d	1	4	Рмнмнмнмнмни	2026-01-05 14:12:19.700482	2026-01-05 14:12:19.700482
ed12469c-74d7-4a57-9a5f-5b551ad1a197	a286785c-dea0-463e-ace5-15fe471bc2ba	1	5	Ппрриоронрррр	2026-01-06 14:24:37.338547	2026-01-06 14:24:37.338547
bcb1ba8a-02c3-4d90-82f4-d565ffd6c3cf	1bb4bf1c-6b1e-4478-bf80-46ea1286fde1	1	5	Гггоо р рмгигигигигмпмкмкм	2026-01-06 14:28:06.939649	2026-01-06 14:36:34.805358
32b5a8a7-0a9b-4e8c-8c64-13df8f4370d8	1bb4bf1c-6b1e-4478-bf80-46ea1286fde1	3	5	Очень неплохо ура	2026-01-06 14:50:16.333239	2026-01-06 14:50:34.862273
a831ffd5-3204-4f7e-890c-10c717346b6e	582739bb-a26c-433d-9379-6ef2d2e64b95	3	5	Vttvtvyvtvtv5c4c	2026-01-06 15:06:28.205701	2026-01-06 15:06:28.205701
5f8c580c-bfca-4ff1-af0d-30958d2c67db	13cba35b-d5af-4a87-8efa-d0ca40d0f223	3	5	Hyybybyyvyvyvyv	2026-01-06 15:07:49.499821	2026-01-06 15:07:49.499821
fa027195-6cc8-43b9-a1cd-baf1f840a458	d9a396f1-0230-4d58-b2b4-417e8bc1d82a	3	3	Ct5v5v5f5f5fghg	2026-01-06 15:13:57.101671	2026-01-06 15:14:02.718004
7f56d7d7-ff09-4cb0-a024-fc258a82b001	a948bc42-f808-42ba-907d-ee2078663617	3	5	Tggyvyvvyvyvt	2026-01-06 20:09:17.724014	2026-01-06 20:09:17.724014
11e17daa-182b-4a1b-bce6-526cdd7a5d88	e8dae0d0-f4cc-46d4-9e1d-2c19c0687ebc	6	5	Ояень доволен приобретением	2026-01-24 10:28:52.535525	2026-01-24 10:28:52.535525
c363a283-f700-4cdc-abb3-5c68551394c0	961179e0-5ad7-4ddf-b9f5-724ab15f3656	6	5	Очень хорошие кроссовки	2026-01-24 10:42:16.251457	2026-01-24 10:42:16.251457
580ac174-47e1-4cfd-81d3-cc3c01b35706	4935e0ef-83dc-40f1-99ff-daf4ad409927	8	5	Пррррпрррр	2026-02-12 13:32:04.002836	2026-02-12 13:32:04.002836
dfa7ed5b-79bf-4224-b787-5605362f4735	13cba35b-d5af-4a87-8efa-d0ca40d0f223	1	2	Гггороооррьаататан	2026-01-23 13:42:39.26007	2026-02-16 11:01:32.632558
f3912ef7-8bd9-46fb-b6e6-9e1829623e9e	c112da03-3dfe-4de0-afeb-692684e1e1f6	1	4	Ааоаобстаь	2026-02-16 11:01:47.013691	2026-02-16 11:01:47.013691
\.


--
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.support_tickets (id, "userId", subject, message, status, "adminResponse", "createdAt", "updatedAt") FROM stdin;
1	1	Проблема с заказом моим последним	Ниче не работает	resolved	Проблема решена	2026-01-09 11:28:03.117291	2026-01-09 11:31:30.054508
2	1	Прости	Прости пожалуйста	closed	Приноси извенения	2026-02-16 11:07:05.329267	2026-02-16 11:09:10.157197
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."user" (id, uuid, email, password, role, "isBanned", "refreshToken", "tokenVersion", "resetPasswordToken", "tokenExpiredDate", "isOAuthUser", "profileId") FROM stdin;
3	1f7a54d1-9d3c-4781-a6cd-ad82e077097e	dimapikull9@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$SkuCgYsYN/jxUi+Coi5xRQ$Xzk8MMZpWR9JdKxLcZCWXI+20ltR41B7ERPDZZHQ5nw	user	f	\N	0	\N	\N	f	3
6	5fb90911-cd6e-43d3-b8b5-f5e367adf10a	nikita13@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$4uBL+fTsoX9/wkHxu0TJhw$B1ELZgx46BqbxY/46hQsuR9Tj1aiCs2u2ONWHZs6IKk	user	f	\N	0	\N	\N	f	6
7	0bc3adf4-8b12-4582-a512-cd2379d9eee7	dhhshhfx@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$KGBb3cqjkFcxq9wChs0tlw$cSD1tuwAp6sIEMu0ISCebuhfGNERjPnDsRV9WxBCJ1s	user	f	\N	0	\N	\N	f	7
8	fd174760-f38c-4e46-be62-50b0ea395278	nikita163@gmail.comn	$argon2id$v=19$m=65536,t=3,p=4$Po6RqDGXXtkfWPI6hifPwQ$kLhLAtH3udk+R/N3SyY2odxezwvWzLARio7IenKLQfw	user	f	\N	0	\N	\N	f	8
2	02452349-c074-40fc-82b4-6d73c0ff38ed	admin@example.com	$argon2id$v=19$m=65536,t=3,p=4$16FIMkeV5Zo8fOW2t/9bEQ$iDAZElKeZzKXYGV2AtiKdDz2bSdXzZI1++jHuQ5kf48	admin	f	\N	0	\N	\N	f	2
4	681d60a9-bc97-4dec-9e7a-81da789b4804	nekit123@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$GVfepy3cbUvSDIPDns0Siw$zp+dE8xqQ/xO1OWOnvaTh2FPJ2/LgmB1hJ2mi9ZquqY	user	f	\N	0	\N	\N	f	4
9	e1e80ee2-bd46-48a1-a9f0-af636facf0fb	nikita12345@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$XvlOSU6nGtJ0JYgRWD8ByQ$LxAVSE69/IIgfvQ637gkRKed4h6MH8JFfTVf67h4Lz0	user	f	\N	0	\N	\N	f	9
5	c751e005-d68c-4c92-a70e-e46f1f0d2d5c	nikita123@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$fgm6P7X4tHyD6y5L/R7gIA$VphynxPQca17G6XebD2uQp/wP2tQ2jDlbAvNRPPAEFM	user	f	\N	0	\N	\N	f	5
1	411c1a38-5b99-4a28-941f-b0908ee3b1ca	dmitrypikulik77@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$uDHbQj14FVbnByHvVKAeWw$eymYwc+Uc9ATeI80Xvpd+X5c2EWvza6J7Kt74LtoxaE	user	f	\N	0	\N	\N	f	1
\.


--
-- Name: profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.profile_id_seq', 9, true);


--
-- Name: support_tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.support_tickets_id_seq', 2, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_id_seq', 9, true);


--
-- Name: order_items PK_005269d8574e6fac0493715c308; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY (id);


--
-- Name: products PK_0806c755e0aca124e67c0cf6d7d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY (id);


--
-- Name: reviews PK_231ae565c273ee700b283f15c1d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY (id);


--
-- Name: categories PK_24dbc6126a28ff948da33e97d3b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY (id);


--
-- Name: profile PK_3dd8bfc97e4a77c70971591bdcb; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY (id);


--
-- Name: banner PK_6d9e2570b3d85ba37b681cd4256; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banner
    ADD CONSTRAINT "PK_6d9e2570b3d85ba37b681cd4256" PRIMARY KEY (id);


--
-- Name: cart_items PK_6fccf5ec03c172d27a28a82928b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY (id);


--
-- Name: orders PK_710e2d4957aa5878dfe94e4ac2f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY (id);


--
-- Name: favorites PK_783e5111df14529ff6124351b16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT "PK_783e5111df14529ff6124351b16" PRIMARY KEY ("userId", "productId");


--
-- Name: support_tickets PK_942e8d8f5df86100471d2324643; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT "PK_942e8d8f5df86100471d2324643" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: user REL_9466682df91534dd95e4dbaa61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "REL_9466682df91534dd95e4dbaa61" UNIQUE ("profileId");


--
-- Name: profile REL_a24972ebd73b106250713dcddd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT "REL_a24972ebd73b106250713dcddd" UNIQUE ("userId");


--
-- Name: categories UQ_420d9f679d41281f282f5bc7d09; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE (slug);


--
-- Name: reviews UQ_9007ffba411fd471dfe233dabfb; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "UQ_9007ffba411fd471dfe233dabfb" UNIQUE ("productId", "userId");


--
-- Name: products UQ_c44ac33a05b144dd0d9ddcf9327; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE (sku);


--
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);


--
-- Name: favorites FK_0c7bba48aac77ad13092685ba5b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT "FK_0c7bba48aac77ad13092685ba5b" FOREIGN KEY ("productId") REFERENCES public.products(id);


--
-- Name: orders FK_151b79a83ba240b0cb31b2302d1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: cart_items FK_72679d98b31c737937b8932ebe6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "FK_72679d98b31c737937b8932ebe6" FOREIGN KEY ("productId") REFERENCES public.products(id);


--
-- Name: reviews FK_7ed5659e7139fc8bc039198cc1f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: cart_items FK_84e765378a5f03ad9900df3a9ba; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "FK_84e765378a5f03ad9900df3a9ba" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: support_tickets FK_8679e2ff150ff0e253189ca0253; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT "FK_8679e2ff150ff0e253189ca0253" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: user FK_9466682df91534dd95e4dbaa616; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_9466682df91534dd95e4dbaa616" FOREIGN KEY ("profileId") REFERENCES public.profile(id);


--
-- Name: profile FK_a24972ebd73b106250713dcddd9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT "FK_a24972ebd73b106250713dcddd9" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: reviews FK_a6b3c434392f5d10ec171043666; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "FK_a6b3c434392f5d10ec171043666" FOREIGN KEY ("productId") REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: order_items FK_cdb99c05982d5191ac8465ac010; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES public.products(id);


--
-- Name: favorites FK_e747534006c6e3c2f09939da60f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT "FK_e747534006c6e3c2f09939da60f" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: order_items FK_f1d359a55923bb45b057fbdab0d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES public.orders(id);


--
-- Name: products FK_ff56834e735fa78a15d0cf21926; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES public.categories(id);


--
-- PostgreSQL database dump complete
--

\unrestrict TGDhHrvQLUkyixPBAPhptGm4bCXANDLBHYMQwtFIsRD3Yj73qGHJgD8coKlxb0G

