create table if not exists tc_marches (
  code text primary key,
  paire text not null,
  nom_fr text not null,
  nom_en text not null,
  categorie text not null,
  symbole_tv text not null,
  decimales int not null default 2,
  pip numeric not null default 0.1,
  actif boolean not null default false,
  ordre int not null default 100,
  cree_le timestamptz not null default now()
);

alter table tc_marches enable row level security;

insert into tc_marches (code, paire, nom_fr, nom_en, categorie, symbole_tv, decimales, pip, actif, ordre) values
  ('XAUUSD','XAU/USD','Or / Dollar americain','Gold / US Dollar','metal','OANDA:XAUUSD',2,0.1,true,1),
  ('SPY','SPY','ETF S&P 500','S&P 500 ETF','action','AMEX:SPY',2,0.01,false,10),
  ('QQQ','QQQ','ETF Nasdaq 100','Nasdaq 100 ETF','action','NASDAQ:QQQ',2,0.01,false,11),
  ('NAS100','NAS100','Nasdaq 100','Nasdaq 100','indice','CAPITALCOM:US100',1,1,false,12),
  ('US30','US30','Dow Jones 30','Dow Jones 30','indice','CAPITALCOM:US30',1,1,false,13),
  ('BTCUSD','BTC/USD','Bitcoin / Dollar','Bitcoin / US Dollar','crypto','BITSTAMP:BTCUSD',2,1,false,20),
  ('ETHUSD','ETH/USD','Ethereum / Dollar','Ethereum / US Dollar','crypto','BITSTAMP:ETHUSD',2,0.1,false,21),
  ('EURUSD','EUR/USD','Euro / Dollar','Euro / US Dollar','forex','OANDA:EURUSD',5,0.0001,false,30),
  ('GBPUSD','GBP/USD','Livre / Dollar','Pound / US Dollar','forex','OANDA:GBPUSD',5,0.0001,false,31)
on conflict (code) do nothing;
