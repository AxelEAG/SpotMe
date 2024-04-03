import React from 'react';
import { Badge } from 'native-base';

interface TagsProps {
    title: string;
}

export default function Tags({ title }: TagsProps) { 
    return (
        <Badge m = {2} ml={0} colorScheme={"blue"}>
            {title}
        </Badge>
    );
}
