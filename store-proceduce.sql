-- Table: public.order_history

-- DROP TABLE IF EXISTS public.order_history;

CREATE TABLE IF NOT EXISTS public.order_history
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id integer,
    bot_id integer,
    exchange_id integer,
    client_order_type order_entity_client_order_type_enum NOT NULL DEFAULT 'BASE'::order_entity_client_order_type_enum,
    sequence integer NOT NULL,
    deviation numeric(5,2),
    side character varying(4) COLLATE pg_catalog."default" NOT NULL,
    filled_price numeric(20,10),
    average_price numeric(20,10),
    exit_price numeric(20,10),
    quantity numeric(20,10),
    volume numeric(20,10),
    total_quantity numeric(20,10),
    deal_id integer,
    pair character varying(16) COLLATE pg_catalog."default" NOT NULL,
    binance_order_id character varying(255) COLLATE pg_catalog."default",
    retry_count integer NOT NULL DEFAULT 0,
    price numeric(20,10),
    placed_count integer NOT NULL DEFAULT 0,
    status character varying(64) COLLATE pg_catalog."default" NOT NULL,
    filled_quantity numeric(20,10) DEFAULT '0'::numeric,
    CONSTRAINT "PK_orderHistoryId" PRIMARY KEY (id)
    
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.order_history
    OWNER to postgres;



    -- Table: public.deal_history

-- DROP TABLE IF EXISTS public.deal_history;

CREATE TABLE IF NOT EXISTS public.deal_history
(
    id integer NOT NULL DEFAULT 0,
    user_id integer,
    bot_id integer,
    exchange_id integer,
    client_deal_type deal_entity_client_deal_type_enum NOT NULL DEFAULT 'DCA'::deal_entity_client_deal_type_enum,
    status deal_entity_status_enum NOT NULL DEFAULT 'CREATED'::deal_entity_status_enum,
    start_at timestamp with time zone NOT NULL DEFAULT now(),
    end_at timestamp with time zone,
    profit numeric(20,10),
    pair character varying(16) COLLATE pg_catalog."default" NOT NULL,
    base_order_size numeric(20,10),
    safety_order_size numeric(20,10),
    direction deal_entity_direction_enum NOT NULL DEFAULT 'LONG'::deal_entity_direction_enum,
    deal_start_condition deal_entity_deal_start_condition_enum NOT NULL DEFAULT 'ASAP'::deal_entity_deal_start_condition_enum,
    target_profit_percentage numeric(5,2) NOT NULL DEFAULT '1'::numeric,
    target_stoploss_percentage numeric(5,2) NOT NULL,
    current_safety_trades_count integer NOT NULL DEFAULT 0,
    max_safety_trades_count integer NOT NULL DEFAULT 0,
    max_active_safety_trades_count integer NOT NULL DEFAULT 0,
    price_deviation_percentage numeric(5,2) NOT NULL DEFAULT '1'::numeric,
    safety_order_volume_scale numeric(5,2) NOT NULL DEFAULT '1'::numeric,
    safety_order_step_scale numeric(5,2) NOT NULL DEFAULT '1'::numeric,
    use_stop_loss boolean NOT NULL DEFAULT false,
    start_order_type character varying(64) COLLATE pg_catalog."default" NOT NULL,
    preference_reduce_deal_id integer,
    current_avg_price numeric(20,10) DEFAULT '0'::numeric,
    current_quantity numeric(20,10) DEFAULT '0'::numeric,
    current_reduce_count integer NOT NULL DEFAULT 0,
    max_reduce_count integer NOT NULL DEFAULT 0,
    reduce_deviation_percentage numeric(5,2) NOT NULL DEFAULT '1'::numeric,
    CONSTRAINT "PK_dealHistoryc" PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.deal_history
    OWNER to postgres;


CREATE PROCEDURE move_ToDeal_History()
LANGUAGE SQL
AS $$
	insert into deal_history(id, user_id, bot_id, exchange_id, client_deal_type, 
		status, start_at, end_at, profit, pair, 
		base_order_size, safety_order_size, direction, deal_start_condition, target_profit_percentage, 
		target_stoploss_percentage, max_safety_trades_count, max_active_safety_trades_count, price_deviation_percentage, safety_order_volume_scale, 
		safety_order_step_scale, use_stop_loss, start_order_type, preference_reduce_deal_id, current_avg_price, 
		current_quantity, current_reduce_count, max_reduce_count, reduce_deviation_percentage)
	select  id, user_id, bot_id, exchange_id, client_deal_type, 
		status, start_at, end_at, profit, pair, 
		base_order_size, safety_order_size, direction, deal_start_condition, target_profit_percentage, 
		target_stoploss_percentage, max_safety_trades_count, max_active_safety_trades_count, price_deviation_percentage, safety_order_volume_scale, 
		safety_order_step_scale, use_stop_loss, start_order_type, preference_reduce_deal_id, current_avg_price, 
		current_quantity, current_reduce_count, max_reduce_count, reduce_deviation_percentage
		from deal_entity 
		where status <> 'ACTIVE' and start_at <= now() - interval '3' day;
		
	insert into order_history(id, user_id, bot_id, exchange_id, client_order_type, sequence, 
								deviation, side, filled_price, average_price, exit_price, 
								quantity, volume, total_quantity, deal_id, pair, 
								binance_order_id, retry_count, price, placed_count, status,
								filled_quantity)
	select o1.id, o1.user_id, o1.bot_id, o1.exchange_id, o1.client_order_type, o1.sequence, 
			o1.deviation, o1.side, o1.filled_price, o1.average_price, o1.exit_price, 
			o1.quantity, o1.volume, o1.total_quantity, o1.deal_id, o1.pair, 
			o1.binance_order_id, o1.retry_count, o1.price, o1.placed_count, o1.status,
			o1.filled_quantity 
			from order_entity as o1 inner join deal_entity d1 on d1.id=o1.deal_id  
			where d1.status <> 'ACTIVE' and d1.start_at <= now() - interval '3' day;
			
	delete from order_entity where id in (select o1.id
			from order_entity as o1 inner join deal_entity d1 on d1.id=o1.deal_id  
			where d1.status <> 'ACTIVE' and d1.start_at <= now() - interval '3' day);
			
	delete from deal_entity where status <> 'ACTIVE' and start_at <= now() - interval '3' day;
			
$$;    