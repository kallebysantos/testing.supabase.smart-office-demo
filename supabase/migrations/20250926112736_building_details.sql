create view building_details as
    select
        building,
        json_arrayagg(floor order by floor) as floors
    from (
        select distinct building, floor
        from rooms
    ) t
    group by building
    order by building;
